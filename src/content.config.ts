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
      // Group and deposit rules (client, 20 Nov 2026). Every page prints them from here.
      groups: z
        .object({
          onlineMax: z.number().int().min(1), // largest party the online booking takes
          callAbove: z.boolean(), // parties above onlineMax (and below setMenuFrom) call the restaurant
          setMenuFrom: z.number().int().min(2), // from this size, groups dine from the set menu
          depositFrom: z.number().int().min(1),
          depositPerHead: z.number().positive(), // in the branch currency
          refundHours: z.number().int().min(0), // full refund when cancelled at least this long before
        })
        .nullable(),
      preTheatre: z.tuple([time, time]).nullable(), // first and last seating for the pre-theatre menu
      menus: z.array(z.string()),
      // The branch's own page (/soho/, /covent-garden/, /dubai/).
      page: z.object({
        lines: z.array(z.string().min(1)).length(3),
        lead: z.enum(['tiger', 'gold', 'slate']),
        second: z.string().regex(/^#[0-9a-f]{6}$/),
        opened: z.string().regex(/^\d{4}$/).nullable(),
        stations: z.array(z.string()).min(1),
        signature: z
          .object({ dish: z.string(), label: z.enum(['born-here', 'only-here']), story: z.string().min(1) })
          .nullable(),
        teaser: z.array(z.string()),
        hero: z.string().nullable(),
        gallery: z.array(z.string()),
      }),
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
