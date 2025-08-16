// Export models for use in other parts of the application
// Models are imported when needed to prevent duplicate registration
export { User } from './user';
export { Role } from './roles';
export { Permission } from './permissions';
export { SiteInfo } from './siteInfo';
export { ServiceResponse } from './serviceResponse';
export { Product } from './product';
export { Order } from './order';
export { Expense } from './expense';
export { Category } from './category';

// Ensure models are registered only once
console.log('✅ Models index loaded - models will be registered on first use');
