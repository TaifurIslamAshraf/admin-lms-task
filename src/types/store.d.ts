/* eslint-disable @typescript-eslint/no-explicit-any */

import { IUser } from "./user";

export interface AuthState {
  token: string;
  user: IUser | null;
  isAuthenticated: boolean;
}

// export interface BannerState {
//   topBanner: Banner[];
//   mainBanner: Banner[];
//   allBanner: Banner[];
// }

export interface CategoryState {
  categories: any[];
}

export interface OrderState {
  orders: any[];
}

export interface ProductState {
  products: any[];
}

export interface ReviewState {
  reviews: any[];
}
