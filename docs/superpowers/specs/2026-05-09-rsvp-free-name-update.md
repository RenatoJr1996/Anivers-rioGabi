# RSVP Free Name Update

## Context

The first implementation used seeded MongoDB guests and a public select field. The user requested a simpler public flow: guests type their own name, confirm attendance, and only submitted names are stored in MongoDB.

The user also requested replacing the decorative SVG foliage and pizza with the provided invitation background image.

## Approved Changes

- The public RSVP form will no longer show or depend on a preloaded guest list.
- The public RSVP form will have one text input for the guest name.
- Public cancellation is removed.
- Confirming attendance creates or updates one MongoDB document by normalized name.
- The document status is stored as `confirmed`.
- The existing seeded MongoDB documents must be deleted.
- The public page will use `public/invitation-background.jpg` as the real background image when present.
- A local SVG fallback background will exist so the app still renders if the PNG has not been copied into `public/`.

## Data Behavior

MongoDB still uses the `guests` collection. A submitted guest document keeps this shape:

```ts
{
  _id: ObjectId,
  name: string,
  normalizedName: string,
  status: "confirmed",
  createdAt: Date,
  updatedAt: Date
}
```

If the same normalized name is submitted again, the existing document is updated instead of creating a duplicate.

## Admin Behavior

The admin dashboard remains protected at `/admin`. It will show only the documents currently stored in MongoDB. After cleanup, it starts empty until people confirm presence.

The admin add-guest form remains available as a manual override.

## Visual Behavior

The invitation card uses the background image as the primary visual layer. Text is overlaid in the empty center area with responsive spacing so it does not collide with foliage or pizza. The older separate olive and pizza SVG assets are no longer used by the public page.

On mobile, the invitation keeps enough vertical space for the text, crops the background softly, and moves the RSVP below the invitation.
