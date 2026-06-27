import type { ToolDefinition } from '../../types/index.js';
import { toolDefinition as createProduct } from './create-product.js';
import { toolDefinition as getProduct } from './get-product.js';
import { toolDefinition as updateProduct } from './update-product.js';
import { toolDefinition as archiveProduct } from './archive-product.js';
import { toolDefinition as listProducts } from './list-products.js';

export const tools: ToolDefinition[] = [
  createProduct,
  getProduct,
  updateProduct,
  archiveProduct,
  listProducts,
];
