# Vocabulary cover illustrations

The Day 01 dining cover is the style reference for the series. Days 01–15 follow the original lesson topics. Days 16–50 use the topics below for both the artwork and the playable lessons. Each lesson has ten dictionary-reviewed entries in `src/data/days/dayNN.json`, with Hangul, romanization and English meanings. [Vocabulary review](VOCABULARY-REVIEW.md)

## Where covers appear

- Day page hero beside the lesson title and progress
- Course index and landing-page lesson previews
- Home "Every day is a scene" section: `public/images/hero.webp`
- Link previews: `scripts/make-images.cjs` composes `public/og/dayNN.jpg` from the cover

Each lesson's `cover` field is relative to the site's base URL, for example `images/days/day16.webp`. Store the image in `public/images/days/` so the same JSON works on GitHub Pages and local builds.

The nine WebPs in `docs/artwork-unassigned/` are historical copies from the earlier topic assignment. Their images now appear on Days 20 (post office), 23 (moving), 25 (bakery), 28 (pharmacy), 37 (pottery), 38 (cinema), 44 (pet care), 46 (hotel) and 47 (cycling).

## Specs

- Covers are 1600 × 1000 WebPs at `public/images/days/day01.webp` through `day50.webp`. The Seoul street illustration is at `public/images/hero.webp`.
- The sharing cards are 1200 × 630 JPEGs under 60 KB. Run `node scripts/make-images.cjs --previews-only` after changing covers or lesson titles.
- **No text, letters, Hangul or logos inside the image.** Titles are added in code,
  and AI-drawn Hangul is usually wrong.
- No people's faces up close, no brand names, no flags.

## Shared style (paste this at the start of every prompt)

> Editorial flat illustration, calm and minimal, set in Korea. Warm off-white
> paper background (#F7F5F0). Limited palette: deep ink black, warm greys, one
> accent of muted seal red (#B3261E). Soft paper grain texture, subtle shadows,
> no gradients, no glow, no neon, no text or letters anywhere. Wide 16:10
> composition, generous empty space on the left third.

## Prompts per day

| Day | Topic | Prompt (after the shared style) |
|-----|-------|-------------------------------|
| 01 | Dining out | A small Korean restaurant table seen from above: bowls of rice and soup, banchan side dishes, metal chopsticks and spoon, a menu card with no writing. |
| 02 | Travel preparation | An open suitcase on a bedroom floor with folded clothes, a passport, a phone with a map, and a train ticket shape with no writing. |
| 03 | Student life | A university desk by a window: open notebooks, a pencil case, a laptop, a coffee cup, a backpack on the chair. |
| 04 | Entertainment | A cozy living room evening: a TV glow, popcorn, concert tickets, headphones on a sofa arm. |
| 05 | Decision and opinion | Two paths splitting in a quiet park, with a single bench at the fork. |
| 06 | Family and life | A low Korean dining table set for a family meal at home, several cups and plates, warm lamp light. |
| 07 | Travel experience | A traveler's backpack resting on a stone wall overlooking a Korean coastal town and sea. |
| 08 | Culture and freedom | A hanok courtyard with an open wooden gate, a paper lantern and a pine tree. |
| 09 | Daily life and habits | A morning kitchen counter: alarm clock, toothbrush cup, kettle, and a calendar with no writing. |
| 10 | Imagination | A paper boat on a desk turning into a real boat sailing into a sky of paper clouds. |
| 11 | Personality | Four different houseplants in different pots side by side on a shelf, each with its own character. |
| 12 | Fatigue and change | An empty office chair by a window at dusk, a jacket over the back, autumn leaves outside. |
| 13 | Gardening and weather | A small rooftop garden in Seoul with planters, a watering can and light rain clouds. |
| 14 | Work and time | A clean work desk with a wall clock, a planner, a laptop and a cup of tea, shadows showing late afternoon. |
| 15 | Cleaning at home | A wooden floor with a broom, a mop bucket, a low table, and a chair with one broken leg. |
| 16 | Riding the subway | A slice of a modern Seoul subway carriage interior: two sliding doors with dark windows, three hanging hand straps, a short bench seat with a muted red cushion, vertical stainless-steel support pole and a folded umbrella propped beside it. Simple isolated frontal vignette; no ads or signs. |
| 17 | Asking for directions | Two small adult figures from behind at a Korean neighborhood street corner: one holds a folded paper street map, the other points down the side street. Side of a small hanok-inspired roof gives local context; an arrow-shaped sign is blank. Natural gesture, no facial details, focus on wayfinding and open space. |
| 18 | At the traditional market | A compact covered Korean produce stall seen in three-quarter view: red-edged awning shades straw baskets piled with daikon radishes, napa cabbages and red chilies, and an old mechanical weighing scale with an unnumbered face. No signs or packaging. Make the market scene readable at a glance. |
| 19 | Clothes shopping | A sparse clothes shop vignette: a short garment rack holds an ink-dark jacket, warm-grey shirt and seal-red cardigan. One long dressing mirror reflects the garments, and an unmarked shopping bag rests on a bench. Neat shapes, grouped together in the composition. |
| 20 | At the post office | A compact traditional red Korean freestanding letterbox with a mail slot beside a parcel tied with twine, with two cream envelopes leaning against the parcel. Each envelope carries a totally plain tiny seal-red stamp without a symbol or lettering. Distinct postal scene, no lettering even on letterbox. |
| 21 | At the bank | A Seoul bank teller window vignette: a low counter, glazed screen with small pass-through tray, a compact coin-counting machine, a group of blank coins, a blank open savings passbook and muted red bank card laid on the counter. Render in angled perspective. No signs. All money and financial instruments are abstract blank shapes without markings. |
| 22 | Apartment hunting | Editorial still life of inspecting an apartment: a set of keys with a muted red fob rests atop an architectural floor plan (walls and doors only, absolutely no labels or measurement lines). Behind them is a small isolated three-quarter cutaway model of a contemporary Korean apartment building. No people or writing. |
| 23 | Moving day | Small Seoul apartment moving-day vignette: an open apartment front door with shoes just inside, a two-wheel hand trolley supporting two taped blank cardboard cartons and a red blanket draped over a larger box beside it. A small potted houseplant waits by the door. Spacious, simple geometry. |
| 24 | Cooking at home | A Korean kitchen counter from a three-quarter angle: a small saucepan of broth on a flat stovetop, wooden cutting board with sliced scallions and tofu, kitchen knife resting flat, small earthenware jar and a single red chili. Airy illustrated vignette of meal preparation, no branding or labels. |
| 25 | At the bakery | A neighborhood bakery counter in Seoul. A woven basket of scored milk-bread loaves, a red-bean bun split to show the muted red filling, a pair of bakery tongs resting on a small empty tray. Three-quarter view, clear warm bread silhouettes. |
| 26 | Ordering at a café | A compact counter vignette in a Seoul coffee shop. A small red espresso machine, a latte in a white ceramic cup with simple leaf-shaped milk foam, a stainless steel milk pitcher and a plain order bell. Let the cup lead the eye. Unbranded machine with plain buttons. |
| 27 | Visiting a clinic | An unoccupied consultation station in a Korean neighborhood clinic, simple padded examination couch with a folded paper sheet, a tidy grey stethoscope on a pale round stool and a modest red privacy screen. Calm, composed and welcoming. |
| 28 | At the pharmacy | A Korean neighborhood pharmacy dispensing counter. A small porcelain mortar and pestle, a silver blister pack in three-quarter view, closed medicine carton and two plain cylindrical containers with muted red cap. A few simple bottle silhouettes on a short shelf behind. All packaging completely unprinted. |
| 29 | Exercise and fitness | A Seoul apartment fitness corner, a rolled exercise mat tied with a red band, two hand weights, a coiled skipping rope and a folded towel. A compact, tactile still life at a slight angle with clear separate silhouettes. |
| 30 | Hiking in the mountains | Seoul's Bukhansan as a compact mountain vignette: distinctive pale granite peaks, a curving stone trail and weathered pine. In the foreground a pair of hiking boots with muted red laces and one trekking pole leaned against a rock. Use warm greys for stone and pine. |
| 31 | At the beach | A small still life at a quiet Korean seaside beach: a folded striped red-and-paper parasol tilted open over a towel, simple sandals and a conch shell. Behind them a few calm wave lines and a distant rock outcrop suggest the East Sea. Keep the vignette small and airy. |
| 32 | Winter sports | A Korean ski slope in Pyeongchang. Close foreground skis leaning together upright in snow with a single muted seal-red stripe, two poles and a pair of ski boots. In the background, a distant chairlift and a layered mountain ridge in warm grey ink. No branding or route signs. |
| 33 | At the library | A quiet Seoul neighborhood library alcove. Short wooden shelf of books with varied completely plain spines, an open book with entirely blank pages and an angled muted red reading lamp on a writing desk. Use simple tactile forms and a distinct reading nook silhouette. |
| 34 | Art and museums | A quiet Korean museum gallery vignette: one ink landscape of layered Korean mountains displayed in a black wooden frame, a white porcelain moon jar on a low cubic plinth and a simple low viewing bench. A narrow muted red gallery cord on two slender stanchions provides the accent. No wall labels, plaques or visitors. |
| 35 | Playing music | A Korean practice-room still life, centered on a pear-shaped wooden acoustic guitar with muted red fabric strap resting on a small floor stand; a traditional double-headed janggu hourglass drum and two beaters sit beside it, with a low rehearsal stool. Clear string and drum silhouettes, no printed notation or numbers. |
| 36 | Photography | A photographic still life, viewed from high three-quarter angle: an unbranded black manual film camera, lens cap beside the camera, coiled red woven strap, two offset black-and-white prints of a pine tree and a tiled hanok roof. Very simple unlabeled controls, no maker names or dial numerals. No food. |
| 37 | A pottery class | A compact Korean pottery studio vignette: low potter's wheel with a half-thrown pear-shaped clay vase, a tall unglazed bowl on a simple studio stool, two loop tools and a small seal-red slip bowl. Grey-buff clay, round wheel head, concentric throwing ridges, soft daylight. |
| 38 | At the cinema | A small vignette inside a traditional movie theatre: a bank of three muted red velvet folding theater chairs seen obliquely, the nearer seat with a small unmarked cream paper popcorn tub. High behind them is a compact black vintage film projector with two round reels on a high shelf. Keep the seats and equipment entirely in frame. |
| 39 | A birthday celebration | A Korean birthday setting on a small circular tray: a modest cream-frosted birthday cake topped with two slim red candles, a small lidded gift box with a red ribbon, and a dark ceramic bowl of Korean seaweed soup with visible seaweed shapes. Candles, cake, gift and bowl are distinct. Plain cake top and no number candles. |
| 40 | Chuseok traditions | A Korean harvest holiday still life beneath a softly printed full moon disk. A shallow bamboo tray of neatly crescent-shaped songpyeon rice cakes rests beside a square gift wrapped in knotted red bojagi fabric, a small autumn pear, and pine needles. Delicate arcs of Korean rice-cake seams and a clear fabric knot. No labels or ceremonial writing. |
| 41 | At the hair salon | A quiet neighborhood hair salon in Korea seen in three-quarter view: a single vintage hydraulic barber chair upholstered in muted red, a compact oval mirror on a short wall panel, and a wheeled metal salon cart holding a comb, closed scissors, and an unmarked pump bottle. No mirror reflections of people, no signage, no long shadows. |
| 42 | At the laundromat | A Korean neighborhood laundromat vignette: two side-by-side front-loading washers with large round glass doors, one neatly folded towel on the machine and a cream mesh laundry basket in the foreground with a red striped hand towel over its edge. Clean warm gray metal, simple round controls entirely free of letters or digits. No signage, people or branding. |
| 43 | Recycling at home | An apartment recycling corner seen in three-quarter view: a short row of open sorting baskets holding gently bundled newspapers with entirely blank pages, folded cardboard, a few unlabelled glass bottles, and clean empty tins. One muted-red basket handle. Make the different materials legible via shape; no recycling logos. |
| 44 | Caring for a pet | A small cream-colored Jindo dog sitting calmly beside a soft red leash, a food bowl, and grooming brush laid on a mat in a Korean apartment entryway. Show the whole animal in readable silhouette, gently curious ears. Quiet domestic scene. |
| 45 | Taking a train | A streamlined intercity passenger train pulled up alongside a quiet Korean railway platform, with one red-accented wheeled suitcase upright next to a bench. Three-quarter perspective with the train nose as the focal point and a short suggestion of track. No signage, letters or numbers. |
| 46 | Checking into a hotel | A Korean boutique hotel reception: a modest wooden check-in counter with a brass bell, an old-fashioned key and blank red fob, and one small upright suitcase beside the counter. A traditional lattice screen panel suggests the place. No signage or labels. |
| 47 | Cycling by the river | A simple upright commuter bicycle with one muted-red rear pannier leaning against a low railing beside Seoul’s Han River. Beyond it, a quiet arch bridge and distant apartment skyline in just a few spare ink-and-grey shapes. A light breeze bends one reed. |
| 48 | Lost and found | A Korean station lost-property counter: a cubby shelf holding one closed umbrella with a red curved handle, an abandoned mitten, a scarf and a plain pouch. A matching lone mitten lies on the counter in the foreground as though someone came to claim it. No labels or signs. |
| 49 | Household repairs | An open wooden household toolbox, a small hammer resting beside a loose cabinet hinge, screwdriver, two screws, and a muted-red-handled pair of pliers on a Korean apartment work surface. Items clearly separated in a tactile top-down still life; tools simply at rest. |
| 50 | Graduation day | A folded black graduation gown with a mortarboard and a muted-red tassel, a rolled unlettered diploma tied with ribbon, and a small paper-wrapped congratulatory bouquet laid on a Korean university courtyard bench. An understated closing illustration; keep all primary elements compact. |

## Site hero

> A Seoul street at early morning seen from a quiet alley: shop shutters, a
> bicycle, a convenience store glow, power lines, a few distant pedestrians
> from behind. Leave the left half calm for the headline.

## Checklist before adding images

- [x] All images share the same style and palette
- [x] No visible text or letters
- [x] File names match `dayNN.webp`
- [x] Every WebP is 1600 × 1000 and under 132 KB after export
