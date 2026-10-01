"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../../services/api");
const catalog_1 = require("../../../data/catalog");
const question_import_1 = require("../../../services/question-import");
const question_pdf_import_1 = require("../../../services/question-pdf-import");
const MAX_JSON_FILE_SIZE = 700 * 1024;
const MAX_PDF_FILE_SIZE = 10 * 1024 * 1024;
const OTHER_SUBJECTS = catalog_1.SUBJECTS.filter((subject) => subject.id !== 'subject-xingce');
const SIMPLE_TEMPLATE = JSON.stringify({
    title: '2025 年某地考试真题',
    year: 2025,
    source: '2025 年某地考试',
    subject: '行政职业能力测验',
    questions: [{
            type: 'SINGLE',
            stem: '题干内容',
            options: { A: '选项 A', B: '选项 B', C: '选项 C', D: '选项 D' },
            answer: 'A',
            analysis: '答案解析',
            chapter: '言语理解与表达',
            knowledgePoints: ['片段阅读'],
            difficulty: 2,
        }],
}, null, 2);
function questionCount(bank) {
    var _a, _b;
    return Number(bank.questionCount || ((_a = bank.questionIds) === null || _a === void 0 ? void 0 : _a.length) || ((_b = bank.questions) === null || _b === void 0 ? void 0 : _b.length) || 0);
}
function fileSizeLabel(size) {
    if (size >= 1024 * 1024)
        return `${(size / 1024 / 1024).toFixed(1)} MB`;
    return `${Math.max(1, Math.ceil(size / 1024))} KB`;
}
function readFile(filePath, encoding) {
    return new Promise((resolve, reject) => {
        const options = { filePath, success: resolve, fail: reject };
        if (encoding)
            options.encoding = encoding;
        wx.getFileSystemManager().readFile(options);
    });
}
function previewOf(normalized, extra = {}) {
    const questions = Array.isArray(normalized.questions) ? normalized.questions : [];
    const countType = (type) => questions.filter((item) => item.type === type).length;
    const warnings = Array.isArray(extra.warnings)
        ? extra.warnings.filter(Boolean).map((item) => String(item))
        : [];
    return {
        title: normalized.title || '未命名题库',
        meta: [normalized.year, normalized.source].filter(Boolean).join(' · '),
        questionCount: questions.length,
        singleCount: countType('SINGLE'),
        multipleCount: countType('MULTIPLE'),
        judgeCount: countType('JUDGE'),
        format: extra.format || 'JSON',
        extractedTextLength: Number(extra.extractedTextLength || 0),
        detectedQuestionCount: Number(extra.detectedQuestionCount || questions.length),
        skippedQuestionCount: Number(extra.skippedQuestionCount || 0),
        warnings: warnings.slice(0, 3),
        warningMoreCount: Math.max(0, warnings.length - 3),
    };
}
Page({
    pendingImport: null,
    data: {
        loading: true,
        parsing: false,
        importing: false,
        selectedKind: 'CIVIL_REAL',
        kinds: [
            { value: 'CIVIL_REAL', label: '考公真题', note: '国考、省考等' },
            { value: 'OTHER', label: '其他题', note: '考研、课程与自建题' },
        ],
        overview: {
            civilReal: { bankCount: 0, questionCount: 0 },
            other: { bankCount: 0, questionCount: 0 },
        },
        banks: [],
        selectedFile: null,
        preview: null,
        subjects: OTHER_SUBJECTS,
        subjectIndex: 0,
        selectedSubjectId: ((_a = OTHER_SUBJECTS[0]) === null || _a === void 0 ? void 0 : _a.id) || '',
        selectedSubjectName: ((_b = OTHER_SUBJECTS[0]) === null || _b === void 0 ? void 0 : _b.name) || '',
    },
    async onLoad(options) {
        const selectedKind = options.kind === 'OTHER' ? 'OTHER' : 'CIVIL_REAL';
        this.setData({ selectedKind });
        await this.loadBanks();
    },
    async onPullDownRefresh() {
        await this.loadBanks();
        wx.stopPullDownRefresh();
    },
    async loadBanks() {
        try {
            const [banks, overview] = await Promise.all([
                api_1.api.listImportedQuestionBanks(this.data.selectedKind),
                api_1.api.getImportedQuestionOverview(),
            ]);
            this.setData({
                overview,
                banks: banks.map((bank) => ({
                    ...bank,
                    questionCount: questionCount(bank),
                    meta: [bank.year, bank.source].filter(Boolean).join(' · ') || bank.fileName,
                })),
                loading: false,
            });
        }
        catch (error) {
            this.setData({ loading: false });
            wx.showToast({ title: error.message || '题库加载失败', icon: 'none' });
        }
    },
    async chooseKind(event) {
        if (this.data.parsing || this.data.importing)
            return;
        const selectedKind = event.currentTarget.dataset.value;
        if (selectedKind === this.data.selectedKind)
            return;
        this.pendingImport = null;
        this.setData({ selectedKind, selectedFile: null, preview: null, loading: true });
        await this.loadBanks();
    },
    chooseSubject(event) {
        var _a;
        if (this.data.parsing || this.data.importing)
            return;
        const subjectIndex = Number(event.detail.value || 0);
        const subject = this.data.subjects[subjectIndex];
        if (!subject)
            return;
        const clearPdf = ((_a = this.data.selectedFile) === null || _a === void 0 ? void 0 : _a.format) === 'PDF';
        if (clearPdf)
            this.pendingImport = null;
        this.setData({
            subjectIndex,
            selectedSubjectId: subject.id,
            selectedSubjectName: subject.name,
            ...(clearPdf ? { selectedFile: null, preview: null } : {}),
        });
    },
    chooseFile() {
        if (this.data.parsing || this.data.importing)
            return;
        wx.chooseMessageFile({
            count: 1,
            type: 'file',
            extension: ['pdf', 'json'],
            success: (result) => {
                var _a;
                const file = (_a = result.tempFiles) === null || _a === void 0 ? void 0 : _a[0];
                if (!file)
                    return;
                const isPdf = /\.pdf$/i.test(file.name || '');
                const isJson = /\.json$/i.test(file.name || '');
                if (!isPdf && !isJson) {
                    wx.showToast({ title: '请选择 PDF 或 JSON 文件', icon: 'none' });
                    return;
                }
                const size = Number(file.size || 0);
                const maxSize = isPdf ? MAX_PDF_FILE_SIZE : MAX_JSON_FILE_SIZE;
                if (size > maxSize) {
                    wx.showToast({ title: isPdf ? 'PDF 不能超过 10MB' : 'JSON 不能超过 700KB', icon: 'none' });
                    return;
                }
                const filePath = file.path || file.tempFilePath;
                if (!filePath) {
                    wx.showToast({ title: '无法读取该文件', icon: 'none' });
                    return;
                }
                const format = isPdf ? 'PDF' : 'JSON';
                this.pendingImport = null;
                this.setData({
                    parsing: true,
                    selectedFile: {
                        name: file.name || `question-bank.${format.toLowerCase()}`,
                        size: fileSizeLabel(size),
                        format,
                    },
                    preview: null,
                });
                setTimeout(() => this.parseFile(file, filePath, format), 30);
            },
            fail: (error) => {
                if (!String((error === null || error === void 0 ? void 0 : error.errMsg) || '').includes('cancel')) {
                    wx.showToast({ title: '文件选择失败', icon: 'none' });
                }
            },
        });
    },
    async parseFile(file, filePath, format) {
        try {
            const readResult = await readFile(filePath, format === 'JSON' ? 'utf8' : undefined);
            if (format === 'PDF') {
                const parsed = await Promise.resolve((0, question_pdf_import_1.parseQuestionBankPdf)(readResult.data, this.data.selectedKind, file.name || 'question-bank.pdf', this.data.selectedKind === 'OTHER' ? this.data.selectedSubjectId : undefined));
                this.pendingImport = parsed.bank;
                this.setData({
                    preview: previewOf(parsed.bank, {
                        format,
                        warnings: parsed.warnings,
                        extractedTextLength: parsed.extractedTextLength,
                        detectedQuestionCount: parsed.detectedQuestionCount,
                        skippedQuestionCount: parsed.skippedQuestionCount,
                    }),
                });
            }
            else {
                const normalized = (0, question_import_1.parseQuestionBankJson)(String(readResult.data || ''), this.data.selectedKind);
                this.pendingImport = normalized;
                this.setData({ preview: previewOf(normalized, { format }) });
            }
        }
        catch (error) {
            this.pendingImport = null;
            this.setData({ selectedFile: null, preview: null });
            wx.showModal({
                title: format === 'PDF' ? 'PDF 识别失败' : '文件无法导入',
                content: error.message || (format === 'PDF' ? '未能从 PDF 中识别出题目' : '请检查题库格式'),
                showCancel: false,
            });
        }
        finally {
            this.setData({ parsing: false });
        }
    },
    async confirmImport() {
        if (!this.pendingImport || !this.data.selectedFile || this.data.parsing || this.data.importing)
            return;
        this.setData({ importing: true });
        try {
            const result = await api_1.api.importQuestionBank(this.pendingImport, this.data.selectedKind, this.data.selectedFile.name);
            const count = questionCount(result) || this.data.preview.questionCount;
            this.pendingImport = null;
            this.setData({ selectedFile: null, preview: null });
            wx.showToast({ title: `已导入 ${count} 题`, icon: 'success' });
            await this.loadBanks();
        }
        catch (error) {
            wx.showModal({ title: '导入失败', content: error.message || '请稍后重试', showCancel: false });
        }
        finally {
            this.setData({ importing: false });
        }
    },
    openBank(event) {
        const id = encodeURIComponent(String(event.currentTarget.dataset.id || ''));
        const title = encodeURIComponent(String(event.currentTarget.dataset.title || '导入题库'));
        if (!id)
            return;
        wx.navigateTo({ url: `/pkg-question/pages/practice-config/index?questionBankId=${id}&bankTitle=${title}` });
    },
    showFormatHelp() {
        wx.showModal({
            title: '支持 PDF 和 JSON',
            content: 'PDF 会自动识别题干、选项、答案和解析，最大 10MB；当前需包含可复制的文字，扫描件暂不支持。“其他题”请先选择科目。JSON 可使用模板精确导入，最大 700KB。',
            showCancel: false,
            confirmText: '知道了',
        });
    },
    copyTemplate() {
        wx.setClipboardData({
            data: SIMPLE_TEMPLATE,
            success: () => wx.showToast({ title: '模板已复制', icon: 'success' }),
        });
    },
});
