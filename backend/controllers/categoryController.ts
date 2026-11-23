import * as categoryService from '../services/categoryService';
import type {
  Category,
  NewCategory,
  UpdateCategory,
} from '../models/Category';
import { fail, run, type ControllerResult } from './result';

/**
 * Controller for the `categories` table.
 */

export async function listCategories(): Promise<ControllerResult<Category[]>> {
  return run(() => categoryService.findAll());
}

export async function getCategory(id: number): Promise<ControllerResult<Category>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid category id');
  }
  return run(async () => {
    const category = await categoryService.findById(id);
    if (!category) throw new Error('Category not found');
    return category;
  });
}

export async function addCategory(
  input: NewCategory
): Promise<ControllerResult<number>> {
  if (!input.category_name?.trim()) return fail('Category name is required');
  return run(async () => {
    const existing = await categoryService.findByName(input.category_name);
    if (existing) throw new Error('Category name already exists');
    return categoryService.create(input);
  });
}

export async function editCategory(
  id: number,
  input: UpdateCategory
): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid category id');
  }
  return run(async () => {
    const existing = await categoryService.findById(id);
    if (!existing) throw new Error('Category not found');
    await categoryService.update(id, input);
  });
}

export async function deleteCategory(id: number): Promise<ControllerResult<void>> {
  if (!Number.isInteger(id) || id <= 0) {
    return fail('Invalid category id');
  }
  return run(async () => {
    const existing = await categoryService.findById(id);
    if (!existing) throw new Error('Category not found');
    await categoryService.remove(id);
  });
}

export type { Category };