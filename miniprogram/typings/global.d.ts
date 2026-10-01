declare const wx: any;
declare function App<T = any>(options: T): void;
declare function Page<T = any>(options: T): void;
declare function Component<T = any>(options: T): void;
declare function getApp<T = any>(): T;
declare const getCurrentPages: () => any[];

interface IAppOption {
  globalData: {
    user: any;
  };
  onLaunch?: () => void | Promise<void>;
}
