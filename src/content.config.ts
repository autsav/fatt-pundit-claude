import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Single source of truth for branches, dishes/drinks and menus.
 * Build FAILS if any JSON entry breaks these schemas.
 * Cross-file checks (menu -> dish ids, branch -> menu ids) live in scripts/validate-data.mjs.
 */

const money = z
  .object({ GBP: z.number().positive().optional(), AED: z.number().positive().optional() })
  .refine((p) => p.GBP !== undefined || p.AED !== undefined, 'price needs at least one currency');

const priceOption = z.object({ label: z.string().min(1), price: money });

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'time must be HH:MM (24h)');
const day = z.array(z.tuple([time, time])); // [] = closed that day
const hours = z.object({ mon: day, tue: day, wed: day, thu: day, fri: day, sat: day, sun: day });

const branches = defineCollection({
  loader: file('src/data/branches.json'),
  schema: z
    .object({
      id: z.string(),
      order: z.number().int(),
      name: z.string(),
      shortName: z.string(),
      status: z.enum(['open', 'opening-soon', 'closed']),
      mark: z.enum(['tiger-indian', 'tiger-chinese']).nullable(),
      address: z.object({
        street: z.string(),
        locality: z.string(),
        city: z.string(),
        postcode: z.string().nullable(),
        country: z.enum(['GB', 'AE']),
      }),
      geo: z.object({ lat: z.number(), lng: z.number() }).nullable(),
      timezone: z.enum(['Europe/London', 'Asia/Dubai']),
      currency: z.enum(['GBP', 'AED']),
      locale: z.string(),
      phone: z.string().regex(/^\+\d{8,15}$/).nullable(),
      email: z.email().nullable(),
      booking: z
        .object({ provider: z.enum(['opentable', 'sevenrooms', 'resdiary', 'other']), url: z.url(), widgetId: z.string().nullable() })
        .nullable(),
      hours: hours.nullable(),
      delivery: z.array(z.object({ provider: z.enum(['deliveroo', 'uber-eats']), url: z.url() })),
      clickAndCollectUrl: z.url().nullable(),
      vouchersUrl: z.url().nullable(),
      groupsNote: z.string().nullable(),
      menus: z.array(z.string()),
    })
    .refine((b) => b.status !== 'open' || (b.booking && b.hours && b.phone), {
      message: 'an open branch needs booking, hours and phone',
    }),
});

const dishes = defineCollection({
  loader: file('src/data/dishes.json'),
  schema: z
    .object({
      id: z.string().regex(/^[a-z0-9-]+$/),
      kind: z.enum(['food', 'drink']),
      name: z.string(),
      section: z.string(),
      description: z.string().optional(),
      price: money.optional(),
      options: z.array(priceOption).optional(),
      tags: z.array(z.enum(['V', 'VG', 'GF', 'DF', 'H'])),
      tagNote: z.string().optional(),
      signature: z.boolean().optional(),
      source: z.enum(['guidelines-pdf']).optional(),
    })
    .refine((d) => !(d.price && d.options), 'use price OR options, not both'),
});

const menus = defineCollection({
  loader: file('src/data/menus.json'),
  schema: z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string(),
    kind: z.enum(['a-la-carte', 'diet', 'set', 'pre-theatre', 'drinks']),
    diet: z.enum(['vegan', 'vegetarian', 'halal', 'gluten-free', 'dairy-free', 'pescatarian']).optional(),
    order: z.number().int(),
    branches: z.array(z.string()).min(1),
    showPrices: z.boolean(),
    intro: z.string().optional(),
    setPrice: z.array(priceOption).optional(),
    sections: z
      .array(
        z.object({
          title: z.string(),
          note: z.string().optional(),
          items: z.array(z.object({ dish: z.string() })).min(1),
        }),
      )
      .min(1),
    allergyNote: z.string(),
    source: z.string(),
  }),
});

export const collections = { branches, dishes, menus };
