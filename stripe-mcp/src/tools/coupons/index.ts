import type { ToolDefinition } from '../../types/index.js';
import { toolDefinition as createCoupon } from './create-coupon.js';
import { toolDefinition as getCoupon } from './get-coupon.js';
import { toolDefinition as deleteCoupon } from './delete-coupon.js';
import { toolDefinition as listCoupons } from './list-coupons.js';

export const tools: ToolDefinition[] = [createCoupon, getCoupon, deleteCoupon, listCoupons];
