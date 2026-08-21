import { z } from 'zod';

/** Treat null as an empty object so `.default(...)` fields apply. */
function nullish<T extends z.ZodType>(schema: T): z.ZodType<z.output<T>> {
  return z.preprocess((value) => (value === null ? {} : value), schema);
}

export const GeoDtoSchema = z.object({
  lat: z.string().default(''),
  lng: z.string().default(''),
});

export const AddressDtoSchema = z.object({
  street: z.string().default(''),
  suite: z.string().default(''),
  city: z.string().default(''),
  zipcode: z.string().default(''),
  geo: nullish(GeoDtoSchema).default({ lat: '', lng: '' }),
});

export const CompanyDtoSchema = z.object({
  name: z.string().default(''),
  catchPhrase: z.string().default(''),
  bs: z.string().default(''),
});

export const UserDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
  phone: z.string().default(''),
  website: z.string().default(''),
  address: nullish(AddressDtoSchema).default({
    street: '',
    suite: '',
    city: '',
    zipcode: '',
    geo: { lat: '', lng: '' },
  }),
  company: nullish(CompanyDtoSchema).default({ name: '', catchPhrase: '', bs: '' }),
});

export type UserDto = z.infer<typeof UserDtoSchema>;

export const UserDtoArraySchema = z.array(UserDtoSchema);
