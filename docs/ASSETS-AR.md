# Arabic course illustrations

The Arabic course reuses the Korean course's look: the same paper ground, ink and seal-red accent, the same 16:10 covers. Only the setting changes, to everyday life in the Arab world. Look at `public/images/days/day01.webp` and `public/images/hero.webp` before starting, and match their line weight, texture and amount of empty space.

The word lists for every day are in `src/data/ar/dayNN.json`. Read a day's ten words before drawing it, so the scene shows things the lesson teaches.

## Files

| What | Path | Size |
| --- | --- | --- |
| Day covers | `public/images/ar/days/day01.webp` … `day50.webp` | 1600 × 1000 WebP, under 140 KB each |
| Home scene (the Arabic counterpart of the Seoul street) | `public/images/ar/hero.webp` | 1600 × 1000 WebP |

After adding a cover, set that day's `"cover"` to `"images/ar/days/dayNN.webp"` in `src/data/ar/dayNN.json`. The app shows covers wherever the Korean course does: the day page, the course index and the sharing card.

## Rules

- **No text, letters, Arabic script, numerals or logos anywhere in the image.** Titles are added in code. Generated Arabic script is almost always malformed, and a learner would copy it.
- No close-up faces, no brand names, no flags, no religious figures. Mosques and minarets may appear as architecture in the distance.
- Show the region's variety across the series: Levant, Gulf, Egypt, Maghreb. Do not reduce it to desert and camels.
- Keep the left third calm. The course index crops covers to a square and the sharing card places the title on the left.

## Shared style (paste at the start of every prompt)

> Editorial flat illustration, calm and minimal, set in a modern Arab city or town. Warm off-white paper background (#F6ECDF). Limited palette: deep ink black, warm greys, sand, one accent of muted seal red (#A8322A). Soft paper grain texture, subtle shadows, no gradients, no glow, no neon, no text, letters or script anywhere. Wide 16:10 composition, generous empty space on the left third.

## Home scene

A quiet old-city lane in the late afternoon: carved wooden door, a balcony with a mashrabiya screen, a potted plant, a bicycle leaning on a stone wall, a café chair, a minaret far in the distance.

## Prompts per day

| Day | Topic | Prompt (after the shared style) |
|-----|-------|-------------------------------|
| 01 | Greetings | Two hands meeting in a handshake beside an open front door, a doormat and a small plant. |
| 02 | Numbers | Ten smooth pebbles or dates arranged in a neat row on a low wooden tray, an abacus in the background. |
| 03 | Family | A family meal setting seen from above: a large shared platter, small plates, glasses of tea, cushions around a low table. |
| 04 | Relatives and friends | A row of shoes of different sizes at an entrance, from small child's sandals to grandfather's slippers. |
| 05 | Feelings | Five simple paper masks or tea glasses with different reflections, arranged like a quiet still life. |
| 06 | Jobs | A tidy workbench where tools of different jobs meet: a stethoscope, a chef's knife, a notebook, a toy police cap, a seedling pot. |
| 07 | Time of day | A window frame showing a city skyline, with the sun on one side and a crescent moon on the other. |
| 08 | Days of the week | A wall calendar with blank squares, a pen, and a cup of coffee on a desk. |
| 09 | Weather and seasons | Four small framed panels on a wall: a palm in sun, falling leaves, rain on a window, snow on cedar trees. |
| 10 | Colours and sizes | Spice cones and fabric rolls in a souq stall, in a few muted colours, large and small. |
| 11 | Around town | A small town square: a fountain, a café awning, a minaret far behind, a shop front with shutters half open. |
| 12 | Transport | A street with a bus, a taxi, a bicycle and a tram line, seen side-on and simplified. |
| 13 | On the road | A road bending past palm trees with a petrol station sign shape (no writing) and a parked car. |
| 14 | Trains and buses | A station platform with a waiting train, a bench, a clock and a ticket machine with no writing. |
| 15 | At the airport | A suitcase and a passport on an airport bench, a large window with a plane on the runway. |
| 16 | Directions | A crossroads in an old city with arrows painted on the ground (no letters), a paper map on a bench. |
| 17 | The house | The front of a two-storey house with a courtyard door, arched windows and a potted lemon tree. |
| 18 | The living room | A majlis-style room: floor cushions along the walls, a low table, a rug, curtains and a lamp. |
| 19 | The kitchen | A kitchen counter with a pot on the stove, a knife, spoons, a stack of plates and an open fridge. |
| 20 | Bedroom and bathroom | A bed with a folded blanket beside a small bathroom shelf with soap, a towel and a toothbrush cup. |
| 21 | Shopping | A shopping basket and paper bags on a shop counter, coins and a receipt shape with no writing. |
| 22 | Groceries | Bread, a bottle of olive oil, a jar of honey, a bag of rice, sugar and a teapot on a pantry shelf. |
| 23 | Fruit | A market crate of oranges, figs, pomegranates, dates and a halved watermelon. |
| 24 | Vegetables | Tomatoes, cucumbers, aubergines, onions and garlic on a wooden board at a market stall. |
| 25 | Meat, fish and dairy | A butcher and fishmonger counter: a fish on ice, prawns, a wheel of white cheese, eggs in a bowl. |
| 26 | Meals | A breakfast spread: falafel, a bowl of soup, salad, flatbread and a small dessert plate. |
| 27 | Eating out | A restaurant table for two with a menu card (no writing), a bill tray and folded napkins. |
| 28 | Clothes | A clothes rail with a shirt, a dress, a coat and a scarf, shoes lined up below. |
| 29 | Bags and jewellery | A handbag, a wallet, sunglasses and an umbrella on a shelf, a necklace and bracelet on a dish. |
| 30 | Shops | A short shopping street with a pharmacy cross shape, a bakery window with bread, and a barber's pole. |
| 31 | Daily routine | An alarm clock, a cup of tea, a toothbrush and a folded work shirt laid out on a chair at dawn. |
| 32 | Education | A classroom desk with a book, a notebook, pens and a schoolbag, a blank board behind. |
| 33 | At work | An office desk with a computer, a printer, a report folder and a meeting table behind a glass wall. |
| 34 | Phone and internet | A mobile phone, a laptop and an envelope icon shape (no writing) on a desk with a charging cable. |
| 35 | Bank and post | A bank counter window and a post box side by side, an envelope and a few coins. |
| 36 | The body | A simple wooden artist's mannequin in a relaxed pose on a plain table. |
| 37 | More of the body | A physiotherapy room with an anatomical model of a knee and shoulder, a towel and a mat. |
| 38 | At the doctor's | A clinic room: a stethoscope, a blood-pressure cuff, a prescription pad with no writing, medicine boxes. |
| 39 | Emergencies | An ambulance and a fire engine parked by a hospital entrance, a first-aid kit in the foreground. |
| 40 | Health and fitness | A gym corner with a yoga mat, dumbbells, running shoes and a water bottle. |
| 41 | Free time | A balcony with a reading chair, an open book, headphones and a cup of tea. |
| 42 | Sightseeing | An old citadel or palace gate with a statue, a camera on a strap and a folded tourist map. |
| 43 | Beach and camping | A beach with a tent, a parasol, a barbecue grill and gentle waves, a palm at the edge. |
| 44 | Music and arts | An oud, a frame drum and a violin resting on a cushion beside an easel with a blank canvas. |
| 45 | Sport | A football on a pitch line, goal posts in the distance, a basketball and a referee's whistle. |
| 46 | Pets and farm animals | A farmyard with a camel, a sheep, a goat, a hen, a cat on a wall and a dog by the gate. |
| 47 | Wild animals | A savannah or desert edge with a gazelle, a fox and a tortoise in the foreground, a lion far away. |
| 48 | Nature | A wadi valley with a river, a lake, a mountain, a forest edge and the moon and stars above. |
| 49 | The garden | A courtyard garden with a palm tree, roses, a watering can and seedlings in pots. |
| 50 | Celebrations | A festive table with a cake, wrapped gifts, a lantern (fanous) and string lights. |
