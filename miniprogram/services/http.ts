import { API_BASE_URL } from '../config/index';

export async function request<T>(options: {
  path: string;
  method?: string;
  data?: any;
}): Promise<T> {
  const token = wx.getStorageSync('zhixi.access-token');
  return new Promise<T>((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}${options.path}`,
      method: options.method || 'GET',
      data: options.data,
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success(response: any) {
        if (response.statusCode >= 200 && response.statusCode < 300 && response.data?.code === 200) {
          resolve(response.data.data as T);
          return;
        }
        reject(new Error(response.data?.message || '服务暂时不可用'));
      },
      fail() {
        reject(new Error('网络连接异常，请检查网络后重试'));
      },
    });
  });
}
