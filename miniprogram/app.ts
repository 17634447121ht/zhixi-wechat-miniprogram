import { api } from './services/api';

App<IAppOption>({
  globalData: {
    user: null,
  },

  async onLaunch() {
    await api.initialize();
    this.globalData.user = await api.getProfile();
  },
});
