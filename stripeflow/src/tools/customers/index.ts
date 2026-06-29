import type { ToolDefinition } from '../../types/index.js';
import { toolDefinition as createCustomer } from './create-customer.js';
import { toolDefinition as getCustomer } from './get-customer.js';
import { toolDefinition as updateCustomer } from './update-customer.js';
import { toolDefinition as deleteCustomer } from './delete-customer.js';
import { toolDefinition as listCustomers } from './list-customers.js';
import { toolDefinition as searchCustomers } from './search-customers.js';

export const tools: ToolDefinition[] = [
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  listCustomers,
  searchCustomers,
];
