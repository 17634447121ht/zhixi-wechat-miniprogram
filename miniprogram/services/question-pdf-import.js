"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractQuestionPdfText = extractQuestionPdfText;
exports.parseQuestionBankPdf = parseQuestionBankPdf;
const catalog_1 = require("../data/catalog");
const question_import_1 = require("./question-import");
const fflate_1 = require("../vendor/fflate");
const PDF_HEADER = '%PDF-';
const MAX_EXTRACTED_TEXT = 1200000;
const CIVIL_SUBJECT_ID = 'subject-xingce';
const QUESTION_START = /^\s*(?:第\s*)?(\d{1,3})\s*(?:题\s*)?[.．、:：)）]\s*/gm;
const OPTION_MARKER = /(?:^|\n|[ \t])([A-H])\s*[.．、:：)）]\s*/g;
const ANSWER_MARKER = /[【\[]?\s*(?:(?:参考)?答案|answer)\s*[】\]]?\s*(?::|：|为)?\s*([A-H]{1,8}|正确|错误|对|错|是|否|T|F|√|×)/i;
const ANALYSIS_MARKER = /[【\[]?\s*(?:(?:答案)?解析|analysis|explanation)\s*[】\]]?\s*(?::|：)?\s*/i;
function bytesToLatin1(bytes, start = 0, end = bytes.length) {
    const parts = [];
    for (let offset = start; offset < end; offset += 8192) {
        const slice = bytes.subarray(offset, Math.min(end, offset + 8192));
        let part = '';
        for (let index = 0; index < slice.length; index += 1)
            part += String.fromCharCode(slice[index]);
        parts.push(part);
    }
    return parts.join('');
}
function hexByte(value) {
    return parseInt(value, 16);
}
function hexToBytes(value) {
    const compact = value.replace(/\s/g, '');
    const normalized = compact.length % 2 ? `${compact}0` : compact;
    const result = [];
    for (let index = 0; index < normalized.length; index += 2)
        result.push(hexByte(normalized.slice(index, index + 2)));
    return result;
}
function bytesToHex(bytes) {
    return bytes.map((value) => value.toString(16).padStart(2, '0').toUpperCase()).join('');
}
function unicodeFromHex(value) {
    const bytes = hexToBytes(value);
    if (!bytes.length)
        return '';
    if (bytes.length === 1)
        return String.fromCharCode(bytes[0]);
    const codes = [];
    for (let index = 0; index + 1 < bytes.length; index += 2)
        codes.push((bytes[index] << 8) | bytes[index + 1]);
    return String.fromCharCode(...codes);
}
function incrementHex(value, amount) {
    const bytes = hexToBytes(value);
    let carry = amount;
    for (let index = bytes.length - 1; index >= 0 && carry > 0; index -= 1) {
        const next = bytes[index] + carry;
        bytes[index] = next & 0xff;
        carry = Math.floor(next / 256);
    }
    return bytesToHex(bytes);
}
function parseCMap(content) {
    const values = {};
    const add = (source, target) => {
        const key = source.replace(/\s/g, '').toUpperCase();
        if (key)
            values[key] = unicodeFromHex(target);
    };
    const charSections = content.matchAll(/beginbfchar([\s\S]*?)endbfchar/gi);
    for (const section of charSections) {
        const pairs = section[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g);
        for (const pair of pairs)
            add(pair[1], pair[2]);
    }
    const rangeSections = content.matchAll(/beginbfrange([\s\S]*?)endbfrange/gi);
    for (const section of rangeSections) {
        const lines = section[1].split(/\r?\n/);
        for (const line of lines) {
            const match = line.match(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(.*)/);
            if (!match)
                continue;
            const start = parseInt(match[1], 16);
            const end = parseInt(match[2], 16);
            if (!Number.isFinite(start) || !Number.isFinite(end) || end < start || end - start > 4096)
                continue;
            const tail = match[3].trim();
            if (tail.startsWith('[')) {
                const targets = Array.from(tail.matchAll(/<([0-9A-Fa-f]+)>/g)).map((item) => item[1]);
                for (let offset = 0; offset <= end - start && offset < targets.length; offset += 1) {
                    add((start + offset).toString(16).padStart(match[1].length, '0'), targets[offset]);
                }
            }
            else {
                const target = tail.match(/^<([0-9A-Fa-f]+)>/);
                if (!target)
                    continue;
                for (let offset = 0; offset <= end - start; offset += 1) {
                    add((start + offset).toString(16).padStart(match[1].length, '0'), incrementHex(target[1], offset));
                }
            }
        }
    }
    const codeLengths = Array.from(new Set(Object.keys(values).map((key) => key.length / 2)))
        .filter((length) => length > 0)
        .sort((left, right) => right - left);
    return { values, codeLengths };
}
function ascii85Decode(bytes) {
    const source = bytesToLatin1(bytes).replace(/\s/g, '').replace(/^<~/, '').replace(/~>.*$/, '');
    const output = [];
    let group = [];
    const flush = (values, final) => {
        const originalLength = values.length;
        while (values.length < 5)
            values.push(84);
        let value = 0;
        values.forEach((item) => { value = value * 85 + item; });
        const decoded = [
            Math.floor(value / 0x1000000) & 0xff,
            Math.floor(value / 0x10000) & 0xff,
            Math.floor(value / 0x100) & 0xff,
            value & 0xff,
        ];
        output.push(...(final ? decoded.slice(0, Math.max(0, originalLength - 1)) : decoded));
    };
    for (let index = 0; index < source.length; index += 1) {
        const character = source.charAt(index);
        if (character === 'z' && !group.length) {
            output.push(0, 0, 0, 0);
            continue;
        }
        const value = character.charCodeAt(0) - 33;
        if (value < 0 || value > 84)
            continue;
        group.push(value);
        if (group.length === 5) {
            flush(group, false);
            group = [];
        }
    }
    if (group.length > 1)
        flush(group, true);
    return new Uint8Array(output);
}
function asciiHexDecode(bytes) {
    const value = bytesToLatin1(bytes).replace(/[^0-9A-Fa-f]/g, '');
    return new Uint8Array(hexToBytes(value));
}
function decodeStream(object) {
    if (!object.stream)
        return;
    const filterNames = Array.from(object.dictionary.matchAll(/\/([A-Za-z0-9]+Decode)\b/g)).map((item) => item[1]);
    if (!filterNames.length) {
        object.decodedStream = object.stream;
        return;
    }
    try {
        let decoded = object.stream;
        for (const filter of filterNames) {
            if (filter === 'ASCII85Decode')
                decoded = ascii85Decode(decoded);
            else if (filter === 'ASCIIHexDecode')
                decoded = asciiHexDecode(decoded);
            else if (filter === 'FlateDecode')
                decoded = (0, fflate_1.unzlibSync)(decoded);
            else {
                object.streamError = `暂不支持 ${filter} 压缩流`;
                return;
            }
        }
        object.decodedStream = decoded;
    }
    catch (_error) {
        object.streamError = 'PDF 压缩文本解码失败';
    }
}
function parsePdfObjects(bytes) {
    var _a, _b;
    const source = bytesToLatin1(bytes);
    const headers = Array.from(source.matchAll(/(\d+)\s+(\d+)\s+obj\b/g));
    const objects = new Map();
    headers.forEach((header, index) => {
        const id = Number(header[1]);
        const bodyStart = (header.index || 0) + header[0].length;
        const nextStart = index + 1 < headers.length ? (headers[index + 1].index || source.length) : source.length;
        const endObject = source.lastIndexOf('endobj', nextStart);
        const bodyEnd = endObject >= bodyStart ? endObject : nextStart;
        const body = source.slice(bodyStart, bodyEnd);
        const streamMatch = /stream(?:\r\n|\n|\r)/.exec(body);
        const dictionary = streamMatch ? body.slice(0, streamMatch.index) : body;
        const object = { id, dictionary, body };
        if (streamMatch) {
            const streamStart = bodyStart + (streamMatch.index || 0) + streamMatch[0].length;
            let streamEnd = bodyStart + body.lastIndexOf('endstream');
            const directLength = dictionary.match(/\/Length\s+(\d+)\b/);
            if (directLength) {
                const candidateEnd = streamStart + Number(directLength[1]);
                if (candidateEnd > streamStart && candidateEnd <= bodyEnd)
                    streamEnd = candidateEnd;
            }
            else {
                while (streamEnd > streamStart && (bytes[streamEnd - 1] === 10 || bytes[streamEnd - 1] === 13))
                    streamEnd -= 1;
            }
            if (streamEnd > streamStart)
                object.stream = bytes.slice(streamStart, streamEnd);
        }
        decodeStream(object);
        objects.set(id, object);
    });
    const objectStreams = Array.from(objects.values()).filter((object) => /\/Type\s*\/ObjStm\b/.test(object.dictionary));
    for (const object of objectStreams) {
        if (!object.decodedStream)
            continue;
        const count = Number(((_a = object.dictionary.match(/\/N\s+(\d+)/)) === null || _a === void 0 ? void 0 : _a[1]) || 0);
        const first = Number(((_b = object.dictionary.match(/\/First\s+(\d+)/)) === null || _b === void 0 ? void 0 : _b[1]) || 0);
        if (!count || first <= 0 || first >= object.decodedStream.length)
            continue;
        const header = bytesToLatin1(object.decodedStream, 0, first);
        const numbers = (header.match(/\d+/g) || []).map(Number);
        for (let index = 0; index < count && index * 2 + 1 < numbers.length; index += 1) {
            const childId = numbers[index * 2];
            const offset = numbers[index * 2 + 1];
            const nextOffset = index + 1 < count ? numbers[(index + 1) * 2 + 1] : object.decodedStream.length - first;
            const childBody = bytesToLatin1(object.decodedStream, first + offset, first + nextOffset).trim();
            if (!objects.has(childId))
                objects.set(childId, { id: childId, dictionary: childBody, body: childBody });
        }
    }
    return objects;
}
function referencesIn(value) {
    return Array.from(value.matchAll(/(\d+)\s+\d+\s+R/g)).map((item) => Number(item[1]));
}
function pageObjectIds(objects) {
    var _a;
    const catalog = Array.from(objects.values()).find((object) => /\/Type\s*\/Catalog\b/.test(object.dictionary));
    const rootId = Number(((_a = catalog === null || catalog === void 0 ? void 0 : catalog.dictionary.match(/\/Pages\s+(\d+)\s+\d+\s+R/)) === null || _a === void 0 ? void 0 : _a[1]) || 0);
    const result = [];
    const visited = new Set();
    const walk = (id) => {
        var _a;
        if (!id || visited.has(id))
            return;
        visited.add(id);
        const object = objects.get(id);
        if (!object)
            return;
        if (/\/Type\s*\/Page\b/.test(object.dictionary)) {
            result.push(id);
            return;
        }
        const kids = ((_a = object.dictionary.match(/\/Kids\s*\[([\s\S]*?)\]/)) === null || _a === void 0 ? void 0 : _a[1]) || '';
        referencesIn(kids).forEach(walk);
    };
    walk(rootId);
    if (result.length)
        return result;
    return Array.from(objects.values())
        .filter((object) => /\/Type\s*\/Page\b/.test(object.dictionary))
        .map((object) => object.id)
        .sort((left, right) => left - right);
}
function inheritedResourceText(page, objects) {
    var _a, _b, _c;
    let current = page;
    const visited = new Set();
    while (current && !visited.has(current.id)) {
        visited.add(current.id);
        const resourceId = Number(((_a = current.dictionary.match(/\/Resources\s+(\d+)\s+\d+\s+R/)) === null || _a === void 0 ? void 0 : _a[1]) || 0);
        if (resourceId && objects.get(resourceId))
            return objects.get(resourceId).dictionary;
        const inline = (_b = current.dictionary.match(/\/Resources\s*<<(.*)>>/s)) === null || _b === void 0 ? void 0 : _b[1];
        if (inline)
            return inline;
        const parentId = Number(((_c = current.dictionary.match(/\/Parent\s+(\d+)\s+\d+\s+R/)) === null || _c === void 0 ? void 0 : _c[1]) || 0);
        current = objects.get(parentId);
    }
    return '';
}
function fontsForPage(page, objects, fontCMaps) {
    var _a, _b;
    const source = inheritedResourceText(page, objects);
    const fontResourceId = Number(((_a = source.match(/\/Font\s+(\d+)\s+\d+\s+R/)) === null || _a === void 0 ? void 0 : _a[1]) || 0);
    const fontSection = fontResourceId && objects.get(fontResourceId)
        ? objects.get(fontResourceId).dictionary
        : (((_b = source.match(/\/Font\s*<<([\s\S]*?)>>/)) === null || _b === void 0 ? void 0 : _b[1]) || source);
    const result = {};
    for (const match of fontSection.matchAll(/\/([^\s/<>()\[\]]+)\s+(\d+)\s+\d+\s+R/g)) {
        const fontId = Number(match[2]);
        if (objects.get(fontId) && /\/Type\s*\/Font\b/.test(objects.get(fontId).dictionary))
            result[match[1]] = fontCMaps.get(fontId);
    }
    return result;
}
function literalString(source, state) {
    const bytes = [];
    let depth = 1;
    state.index += 1;
    while (state.index < source.length && depth > 0) {
        const code = source.charCodeAt(state.index) & 0xff;
        state.index += 1;
        if (code === 92) {
            if (state.index >= source.length)
                break;
            const escaped = source.charAt(state.index);
            if (/[0-7]/.test(escaped)) {
                let octal = escaped;
                state.index += 1;
                while (octal.length < 3 && /[0-7]/.test(source.charAt(state.index))) {
                    octal += source.charAt(state.index);
                    state.index += 1;
                }
                bytes.push(parseInt(octal, 8) & 0xff);
            }
            else {
                state.index += 1;
                const escapedCodes = { n: 10, r: 13, t: 9, b: 8, f: 12 };
                if (escaped === '\n')
                    continue;
                if (escaped === '\r') {
                    if (source.charAt(state.index) === '\n')
                        state.index += 1;
                    continue;
                }
                bytes.push(escapedCodes[escaped] === undefined ? escaped.charCodeAt(0) & 0xff : escapedCodes[escaped]);
            }
        }
        else if (code === 40) {
            depth += 1;
            bytes.push(code);
        }
        else if (code === 41) {
            depth -= 1;
            if (depth > 0)
                bytes.push(code);
        }
        else {
            bytes.push(code);
        }
    }
    return { kind: 'string', bytes };
}
function nextToken(source, state) {
    while (state.index < source.length) {
        const character = source.charAt(state.index);
        if (/\s/.test(character)) {
            state.index += 1;
            continue;
        }
        if (character === '%') {
            while (state.index < source.length && !/[\r\n]/.test(source.charAt(state.index)))
                state.index += 1;
            continue;
        }
        break;
    }
    if (state.index >= source.length)
        return undefined;
    const character = source.charAt(state.index);
    if (character === '(')
        return literalString(source, state);
    if (character === '<' && source.charAt(state.index + 1) !== '<') {
        const end = source.indexOf('>', state.index + 1);
        const value = end < 0 ? source.slice(state.index + 1) : source.slice(state.index + 1, end);
        state.index = end < 0 ? source.length : end + 1;
        return { kind: 'string', bytes: hexToBytes(value) };
    }
    if (character === '[') {
        state.index += 1;
        const items = [];
        while (state.index < source.length) {
            while (/\s/.test(source.charAt(state.index)))
                state.index += 1;
            if (source.charAt(state.index) === ']') {
                state.index += 1;
                break;
            }
            const item = nextToken(source, state);
            if (!item)
                break;
            items.push(item);
        }
        return { kind: 'array', items };
    }
    if (character === '/') {
        state.index += 1;
        const start = state.index;
        while (state.index < source.length && !/[\s<>{}\[\]()/%]/.test(source.charAt(state.index)))
            state.index += 1;
        return { kind: 'name', value: source.slice(start, state.index) };
    }
    const start = state.index;
    while (state.index < source.length && !/[\s<>{}\[\]()/%]/.test(source.charAt(state.index)))
        state.index += 1;
    if (state.index === start) {
        state.index += 1;
        return { kind: 'word', value: character };
    }
    const value = source.slice(start, state.index);
    const number = Number(value);
    return Number.isFinite(number) && /^[-+]?\d*\.?\d+$/.test(value)
        ? { kind: 'number', value: number }
        : { kind: 'word', value };
}
function fallbackDecode(bytes) {
    if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff)
        return unicodeFromHex(bytesToHex(bytes.slice(2)));
    const zeroHighBytes = bytes.filter((value, index) => index % 2 === 0 && value === 0).length;
    if (bytes.length % 2 === 0 && zeroHighBytes >= bytes.length / 4)
        return unicodeFromHex(bytesToHex(bytes));
    const replacements = { 128: '•', 133: '…', 145: '‘', 146: '’', 147: '“', 148: '”', 150: '–', 151: '—' };
    return bytes.map((value) => replacements[value] || String.fromCharCode(value)).join('');
}
function decodeText(bytes, cmap) {
    if (!cmap || !cmap.codeLengths.length)
        return fallbackDecode(bytes);
    let result = '';
    for (let index = 0; index < bytes.length;) {
        let matched = false;
        for (const length of cmap.codeLengths) {
            if (index + length > bytes.length)
                continue;
            const key = bytesToHex(bytes.slice(index, index + length));
            if (Object.prototype.hasOwnProperty.call(cmap.values, key)) {
                result += cmap.values[key];
                index += length;
                matched = true;
                break;
            }
        }
        if (!matched) {
            result += fallbackDecode([bytes[index]]);
            index += 1;
        }
    }
    return result;
}
function extractContentText(content, fonts) {
    const source = bytesToLatin1(content);
    const state = { index: 0 };
    const operands = [];
    const output = [];
    let currentFont;
    let lastY;
    const endLine = () => {
        if (output.length && output[output.length - 1] !== '\n')
            output.push('\n');
    };
    const appendBytes = (bytes) => {
        if (!bytes)
            return;
        const value = decodeText(bytes, currentFont ? fonts[currentFont] : undefined).replace(/\u0000/g, '');
        if (value)
            output.push(value);
    };
    const numberOperand = (offset) => {
        const token = operands[operands.length + offset];
        return (token === null || token === void 0 ? void 0 : token.kind) === 'number' ? Number(token.value) : undefined;
    };
    const operators = new Set(['BT', 'ET', 'Tf', 'Tj', 'TJ', 'Tm', 'Td', 'TD', 'T*', "'", '"', 'Do', 'cm', 'q', 'Q']);
    let token;
    while ((token = nextToken(source, state))) {
        if (token.kind !== 'word' || !operators.has(String(token.value))) {
            operands.push(token);
            if (operands.length > 1000)
                operands.splice(0, operands.length - 50);
            continue;
        }
        const operator = String(token.value);
        if (operator === 'Tf') {
            const font = operands.slice().reverse().find((item) => item.kind === 'name');
            currentFont = font ? String(font.value) : currentFont;
        }
        else if (operator === 'Tj' || operator === "'") {
            if (operator === "'")
                endLine();
            const value = operands.slice().reverse().find((item) => item.kind === 'string');
            appendBytes(value === null || value === void 0 ? void 0 : value.bytes);
        }
        else if (operator === '"') {
            endLine();
            const value = operands.slice().reverse().find((item) => item.kind === 'string');
            appendBytes(value === null || value === void 0 ? void 0 : value.bytes);
        }
        else if (operator === 'TJ') {
            const array = operands.slice().reverse().find((item) => item.kind === 'array');
            for (const item of (array === null || array === void 0 ? void 0 : array.items) || []) {
                if (item.kind === 'string')
                    appendBytes(item.bytes);
                else if (item.kind === 'number' && Number(item.value) < -180)
                    output.push(' ');
            }
        }
        else if (operator === 'T*' || operator === 'ET') {
            endLine();
        }
        else if (operator === 'Td' || operator === 'TD') {
            const y = numberOperand(-1);
            if (y !== undefined && Math.abs(y) > 0.1)
                endLine();
        }
        else if (operator === 'Tm') {
            const y = numberOperand(-1);
            if (y !== undefined && lastY !== undefined && Math.abs(y - lastY) > 0.5)
                endLine();
            if (y !== undefined)
                lastY = y;
        }
        operands.length = 0;
    }
    return output.join('');
}
function contentsForPage(page) {
    var _a;
    const array = (_a = page.dictionary.match(/\/Contents\s*\[([\s\S]*?)\]/)) === null || _a === void 0 ? void 0 : _a[1];
    if (array)
        return referencesIn(array);
    const direct = page.dictionary.match(/\/Contents\s+(\d+)\s+\d+\s+R/);
    return direct ? [Number(direct[1])] : [];
}
function extractQuestionPdfText(data) {
    var _a;
    const bytes = new Uint8Array(data);
    if (bytes.length < PDF_HEADER.length || bytesToLatin1(bytes, 0, Math.min(bytes.length, 16)).indexOf(PDF_HEADER) < 0) {
        throw new question_import_1.QuestionImportError('文件不是有效的 PDF');
    }
    const raw = bytesToLatin1(bytes);
    if (/\/Encrypt\b/.test(raw))
        throw new question_import_1.QuestionImportError('暂不支持加密或带密码的 PDF');
    const objects = parsePdfObjects(bytes);
    if (!objects.size)
        throw new question_import_1.QuestionImportError('PDF 结构无法读取');
    const warnings = [];
    const streamErrors = Array.from(new Set(Array.from(objects.values()).map((object) => object.streamError).filter(Boolean)));
    warnings.push(...streamErrors);
    const cmapByObject = new Map();
    for (const object of objects.values()) {
        if (!object.decodedStream)
            continue;
        const content = bytesToLatin1(object.decodedStream);
        if (/begincmap|beginbfchar|beginbfrange/i.test(content))
            cmapByObject.set(object.id, parseCMap(content));
    }
    const fontCMaps = new Map();
    for (const object of objects.values()) {
        if (!/\/Type\s*\/Font\b/.test(object.dictionary))
            continue;
        const toUnicodeId = Number(((_a = object.dictionary.match(/\/ToUnicode\s+(\d+)\s+\d+\s+R/)) === null || _a === void 0 ? void 0 : _a[1]) || 0);
        if (toUnicodeId && cmapByObject.has(toUnicodeId))
            fontCMaps.set(object.id, cmapByObject.get(toUnicodeId));
    }
    const pages = pageObjectIds(objects);
    const pageTexts = [];
    const usedStreams = new Set();
    for (const pageId of pages) {
        const page = objects.get(pageId);
        const fonts = fontsForPage(page, objects, fontCMaps);
        const text = contentsForPage(page)
            .map((contentId) => {
            var _a;
            usedStreams.add(contentId);
            const content = (_a = objects.get(contentId)) === null || _a === void 0 ? void 0 : _a.decodedStream;
            return content ? extractContentText(content, fonts) : '';
        })
            .filter(Boolean)
            .join('\n');
        if (text.trim())
            pageTexts.push(text);
    }
    if (!pageTexts.length) {
        for (const object of objects.values()) {
            if (!object.decodedStream || usedStreams.has(object.id) || cmapByObject.has(object.id))
                continue;
            const source = bytesToLatin1(object.decodedStream);
            if (/\bBT\b/.test(source) && /\bT[Jj]\b/.test(source)) {
                const text = extractContentText(object.decodedStream, {});
                if (text.trim())
                    pageTexts.push(text);
            }
        }
    }
    let text = pageTexts.join('\n\n').normalize('NFKC');
    text = text
        .replace(/\r/g, '\n')
        .replace(/[\t\f\v]+/g, ' ')
        .replace(/[ ]{2,}/g, ' ')
        .replace(/\n[ ]+/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    if (text.length > MAX_EXTRACTED_TEXT) {
        text = text.slice(0, MAX_EXTRACTED_TEXT);
        warnings.push('PDF 文字过多，仅解析了前 120 万字');
    }
    return {
        text,
        pageCount: pages.length || pageTexts.length,
        warnings,
        hasImages: /\/Subtype\s*\/Image\b/.test(raw),
    };
}
function cleanFileName(fileName) {
    let decoded = fileName || '导入真题';
    try {
        decoded = decodeURIComponent(decoded);
    }
    catch (_error) {
        // Keep the original name when it is not URI-encoded.
    }
    return decoded.replace(/\.[Pp][Dd][Ff]$/, '').replace(/\s*\(\d+\)\s*$/, '').trim() || '导入真题';
}
function titleFrom(text, fileName) {
    const fileTitle = cleanFileName(fileName);
    if (!/^(?:question[-_ ]?bank|document|scan|导入真题)$/i.test(fileTitle))
        return fileTitle;
    const line = text.split('\n').map((item) => item.trim()).find((item) => (item.length >= 4
        && item.length <= 80
        && !/^\d{1,3}[.．、:：)）]/.test(item)
        && !/^[A-H][.．、:：)）]/.test(item)
        && !/^(?:答案|解析)/.test(item)));
    return line || fileTitle;
}
function collectAnswerMap(text) {
    const answers = {};
    const explicit = /(?:^|\n)\s*(?:第\s*)?(\d{1,3})\s*(?:题)?\s*[.．、:：)）-]?\s*[【\[]?\s*(?:(?:参考)?答案|answer)\s*[】\]]?\s*(?::|：|为)?\s*([A-H]{1,8}|正确|错误|对|错|是|否|T|F|√|×)/gi;
    for (const match of text.matchAll(explicit))
        answers[Number(match[1])] = match[2];
    const sectionMatch = /(?:^|\n)\s*(?:参考答案|答案汇总|答案速查|answer\s*key|answers)\s*(?::|：)?\s*([\s\S]*)$/i.exec(text);
    if (sectionMatch) {
        const pairs = /(?:^|[\s,，;；])(?:第\s*)?(\d{1,3})\s*(?:题)?\s*[.．、:：)）-]?\s*([A-H]{1,8}|正确|错误|对|错|是|否|T|F|√|×)(?=$|[\s,，;；])/gi;
        for (const match of sectionMatch[1].matchAll(pairs))
            answers[Number(match[1])] = match[2];
    }
    return answers;
}
function questionCandidates(text) {
    const answerSection = /(?:^|\n)\s*(?:参考答案|答案汇总|答案速查|answer\s*key|answers)\s*(?::|：)?\s*(?:\n|$)/i.exec(text);
    const questionText = (answerSection === null || answerSection === void 0 ? void 0 : answerSection.index) === undefined ? text : text.slice(0, answerSection.index);
    const starts = Array.from(questionText.matchAll(QUESTION_START));
    return starts.map((match, index) => ({
        number: Number(match[1]),
        start: match.index || 0,
        end: index + 1 < starts.length ? (starts[index + 1].index || questionText.length) : questionText.length,
        text: questionText.slice((match.index || 0) + match[0].length, index + 1 < starts.length ? (starts[index + 1].index || questionText.length) : questionText.length).trim(),
    }));
}
function subjectIdFor(kind, subjectId) {
    if (kind === 'CIVIL_REAL')
        return CIVIL_SUBJECT_ID;
    if (!subjectId || !catalog_1.SUBJECTS.some((subject) => subject.id === subjectId && subject.id !== CIVIL_SUBJECT_ID)) {
        throw new question_import_1.QuestionImportError('上传其他题 PDF 前，请先选择题目科目');
    }
    return subjectId;
}
function placementFor(subjectId, context) {
    const normalized = context.normalize('NFKC').toLowerCase();
    const rules = {
        'subject-xingce': [
            { chapterId: 'ch-data', pointId: 'kp-growth', keywords: ['资料分析', '增长率', '增长量', '基期'] },
            { chapterId: 'ch-data', pointId: 'kp-share', keywords: ['比重', '占比'] },
            { chapterId: 'ch-reason', pointId: 'kp-definition', keywords: ['定义判断', '定义是指', '属于上述定义'] },
            { chapterId: 'ch-reason', pointId: 'kp-logic', keywords: ['判断推理', '逻辑判断', '必然推出', '真假'] },
            { chapterId: 'ch-quant', pointId: 'kp-work', keywords: ['数量关系', '工程问题', '工作效率'] },
            { chapterId: 'ch-quant', pointId: 'kp-ratio', keywords: ['比例', '比值', '方程'] },
            { chapterId: 'ch-verbal', pointId: 'kp-word-choice', keywords: ['逻辑填空', '选词填空', '填入画横线'] },
            { chapterId: 'ch-verbal', pointId: 'kp-reading-main', keywords: ['言语理解', '片段阅读', '主旨', '意在说明'] },
            { chapterId: 'ch-common', pointId: 'kp-science-common', keywords: ['科技常识', '物理', '化学', '生物'] },
            { chapterId: 'ch-common', pointId: 'kp-law-common', keywords: ['常识判断', '法律', '行政', '宪法', '民法'] },
        ],
        'subject-politics': [
            { chapterId: 'ch-marx', pointId: 'kp-dialectics', keywords: ['马克思', '辩证法', '矛盾', '联系'] },
            { chapterId: 'ch-marx', pointId: 'kp-economy', keywords: ['政治经济学', '剩余价值', '商品价值'] },
            { chapterId: 'ch-mao', pointId: 'kp-theory', keywords: ['中国特色社会主义', '毛中特', '新时代'] },
            { chapterId: 'ch-history', pointId: 'kp-revolution', keywords: ['近现代史', '新民主主义', '革命'] },
            { chapterId: 'ch-law', pointId: 'kp-rule-law', keywords: ['法治', '权利', '义务'] },
        ],
        'subject-english': [
            { chapterId: 'ch-cloze', pointId: 'kp-context', keywords: ['完形填空', 'cloze'] },
            { chapterId: 'ch-reading', pointId: 'kp-detail', keywords: ['阅读理解', 'according to', 'passage'] },
            { chapterId: 'ch-reading', pointId: 'kp-inference', keywords: ['infer', 'imply', '推断'] },
            { chapterId: 'ch-translation', pointId: 'kp-long-sentence', keywords: ['翻译', 'translate'] },
        ],
        'subject-math': [
            { chapterId: 'ch-calculus', pointId: 'kp-limit', keywords: ['高等数学', '极限', '连续'] },
            { chapterId: 'ch-calculus', pointId: 'kp-derivative', keywords: ['导数', '微分', '积分'] },
            { chapterId: 'ch-linear', pointId: 'kp-matrix', keywords: ['线性代数', '矩阵', '向量', '特征值'] },
            { chapterId: 'ch-probability', pointId: 'kp-random-variable', keywords: ['概率', '随机变量', '分布'] },
        ],
        'subject-408': [
            { chapterId: 'ch-ds', pointId: 'kp-tree', keywords: ['数据结构', '二叉树', '树'] },
            { chapterId: 'ch-ds', pointId: 'kp-stack', keywords: ['栈', '队列'] },
            { chapterId: 'ch-ds', pointId: 'kp-graph', keywords: ['图', '最短路径'] },
            { chapterId: 'ch-org', pointId: 'kp-cpu', keywords: ['计算机组成', 'cpu', '处理器', '指令'] },
            { chapterId: 'ch-org', pointId: 'kp-memory', keywords: ['cache', '存储系统', '主存'] },
            { chapterId: 'ch-os', pointId: 'kp-process', keywords: ['操作系统', '进程', '调度', '死锁'] },
            { chapterId: 'ch-os', pointId: 'kp-virtual-memory', keywords: ['虚拟内存', '页面置换', '分页'] },
            { chapterId: 'ch-network', pointId: 'kp-transport', keywords: ['传输层', 'tcp', 'udp'] },
            { chapterId: 'ch-network', pointId: 'kp-network-layer', keywords: ['计算机网络', '网络层', 'ip', '路由'] },
        ],
    };
    const rule = (rules[subjectId] || []).find((item) => item.keywords.some((keyword) => normalized.includes(keyword.toLowerCase())));
    if (rule) {
        return {
            chapter: catalog_1.CHAPTERS.find((item) => item.id === rule.chapterId).name,
            knowledgePoint: catalog_1.KNOWLEDGE_POINTS.find((item) => item.id === rule.pointId).name,
            defaulted: false,
        };
    }
    const chapter = catalog_1.CHAPTERS.find((item) => item.subjectId === subjectId);
    const point = catalog_1.KNOWLEDGE_POINTS.find((item) => item.chapterId === (chapter === null || chapter === void 0 ? void 0 : chapter.id));
    if (!chapter || !point)
        throw new question_import_1.QuestionImportError('所选科目缺少章节配置');
    return { chapter: chapter.name, knowledgePoint: point.name, defaulted: true };
}
function cleanAnswer(value) {
    return value.normalize('NFKC').replace(/[\s,，、;；/|]/g, '').toUpperCase();
}
function optionParts(block) {
    const matches = Array.from(block.matchAll(OPTION_MARKER));
    const answerIndex = block.search(ANSWER_MARKER);
    const analysisIndex = block.search(ANALYSIS_MARKER);
    return matches.map((match, index) => {
        const contentStart = (match.index || 0) + match[0].length;
        const boundaries = [
            index + 1 < matches.length ? (matches[index + 1].index || block.length) : block.length,
            answerIndex >= contentStart ? answerIndex : block.length,
            analysisIndex >= contentStart ? analysisIndex : block.length,
        ];
        const contentEnd = Math.min(...boundaries);
        return {
            key: match[1].toUpperCase(),
            content: block.slice(contentStart, contentEnd).replace(/\s*\n\s*/g, ' ').trim(),
            start: match.index || 0,
            end: contentEnd,
        };
    }).filter((option) => option.content);
}
function parseCandidate(candidate, answerMap, subjectId, context, source, year) {
    var _a;
    const options = optionParts(candidate.text);
    const localAnswer = (_a = candidate.text.match(ANSWER_MARKER)) === null || _a === void 0 ? void 0 : _a[1];
    const answer = cleanAnswer(localAnswer || answerMap[candidate.number] || '');
    if (options.length < 2)
        return { defaulted: false, missingAnalysis: false, reason: '没有识别到至少两个选项' };
    if (!answer)
        return { defaulted: false, missingAnalysis: false, reason: '没有识别到答案' };
    const optionKeys = options.map((option) => option.key);
    if (/^[A-H]+$/.test(answer) && answer.split('').some((key) => !optionKeys.includes(key))) {
        return { defaulted: false, missingAnalysis: false, reason: '答案与选项不匹配' };
    }
    const firstOption = Math.min(...options.map((option) => option.start));
    const stem = candidate.text.slice(0, firstOption).replace(/\s*\n\s*/g, ' ').replace(/[（(]\s*[）)]\s*$/, '').trim();
    if (!stem)
        return { defaulted: false, missingAnalysis: false, reason: '题干为空' };
    const analysisMatch = ANALYSIS_MARKER.exec(candidate.text);
    const analysis = analysisMatch
        ? candidate.text.slice((analysisMatch.index || 0) + analysisMatch[0].length).replace(/\s*\n\s*/g, ' ').trim()
        : '';
    const judgeOptions = options.length === 2
        && options.some((option) => /^(?:正确|对|是|true)$/i.test(option.content))
        && options.some((option) => /^(?:错误|错|否|false)$/i.test(option.content));
    const directJudge = /^(?:正确|错误|对|错|是|否|T|F|√|×)$/i.test(answer);
    const type = judgeOptions || directJudge ? 'JUDGE' : (answer.length > 1 ? 'MULTIPLE' : 'SINGLE');
    const placement = placementFor(subjectId, `${context}\n${stem}`);
    return {
        raw: {
            type,
            stem,
            options: Object.fromEntries(options.map((option) => [option.key, option.content])),
            answer,
            analysis: analysis || '暂无解析',
            chapter: placement.chapter,
            knowledgePoints: [placement.knowledgePoint],
            difficulty: 3,
            source,
            year,
        },
        defaulted: placement.defaulted,
        missingAnalysis: !analysis,
    };
}
function parseQuestionBankPdf(data, bankKind, fileName, subjectId) {
    var _a, _b;
    if (!(data instanceof ArrayBuffer))
        throw new question_import_1.QuestionImportError('PDF 文件读取失败');
    if (bankKind !== 'CIVIL_REAL' && bankKind !== 'OTHER')
        throw new question_import_1.QuestionImportError('题库类型不正确');
    const extraction = extractQuestionPdfText(data);
    if (extraction.text.length < 30) {
        throw new question_import_1.QuestionImportError('没有检测到可搜索文字，可能是扫描版 PDF；请先进行 OCR 后再上传');
    }
    const resolvedSubjectId = subjectIdFor(bankKind, subjectId);
    const title = titleFrom(extraction.text, fileName);
    const yearText = (_a = `${fileName}\n${extraction.text.slice(0, 1500)}`.match(/(?:19|20|21)\d{2}/)) === null || _a === void 0 ? void 0 : _a[0];
    const year = yearText ? Number(yearText) : new Date().getFullYear();
    const source = title;
    const answers = collectAnswerMap(extraction.text);
    const candidates = questionCandidates(extraction.text);
    if (!candidates.length) {
        throw new question_import_1.QuestionImportError('已提取 PDF 文字，但没有识别到编号题目；题号请使用“1.”或“1、”格式');
    }
    const rawQuestions = [];
    const skipped = [];
    let defaultedCount = 0;
    let missingAnalysisCount = 0;
    for (const candidate of candidates) {
        const context = extraction.text.slice(Math.max(0, candidate.start - 600), candidate.start);
        const parsed = parseCandidate(candidate, answers, resolvedSubjectId, context, source, year);
        if (!parsed.raw) {
            skipped.push(`第 ${candidate.number} 题${parsed.reason ? `：${parsed.reason}` : ''}`);
            continue;
        }
        rawQuestions.push(parsed.raw);
        if (parsed.defaulted)
            defaultedCount += 1;
        if (parsed.missingAnalysis)
            missingAnalysisCount += 1;
        if (rawQuestions.length === 200)
            break;
    }
    if (!rawQuestions.length) {
        const reason = skipped[0] ? `（${skipped[0]}）` : '';
        throw new question_import_1.QuestionImportError(`没有识别到可导入题目${reason}；PDF 需包含题号、选项和答案`);
    }
    const subjectName = ((_b = catalog_1.SUBJECTS.find((subject) => subject.id === resolvedSubjectId)) === null || _b === void 0 ? void 0 : _b.name) || resolvedSubjectId;
    const bank = (0, question_import_1.parseQuestionBankJson)(JSON.stringify({ title, source, year, subject: subjectName, questions: rawQuestions }), bankKind);
    const warnings = extraction.warnings.slice();
    if (!yearText)
        warnings.push(`未识别到年份，已按 ${year} 年导入`);
    if (candidates.length > 200)
        warnings.push('最多导入前 200 题，其余题目已跳过');
    if (skipped.length)
        warnings.push(`有 ${skipped.length} 题未满足“题号 + 选项 + 答案”要求，已跳过`);
    if (defaultedCount)
        warnings.push(`有 ${defaultedCount} 题未识别到章节，已归入所选科目的默认章节`);
    if (missingAnalysisCount)
        warnings.push(`有 ${missingAnalysisCount} 题没有解析，已标记为“暂无解析”`);
    if (extraction.hasImages)
        warnings.push('PDF 含图片；图片题干、图表或图片选项可能无法完整导入');
    warnings.push(...skipped.slice(0, 2));
    return {
        bank,
        warnings: Array.from(new Set(warnings)),
        extractedTextLength: extraction.text.length,
        detectedQuestionCount: candidates.length,
        skippedQuestionCount: Math.max(0, candidates.length - rawQuestions.length),
    };
}
