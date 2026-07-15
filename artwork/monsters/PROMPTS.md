# Mood Monster Shelter · Character Prompt Set

生成方式：Codex 内置 `imagegen`。UI 设计图 `_1/screen.png` 与 `_5/screen.png` 仅作为视觉风格参考，不作为编辑目标。

透明素材流程：先在纯色 `#00ff00` 背景生成完全不透底的“果冻观感”角色，再使用 `remove_chroma_key.py` 清除背景。高清透明 PNG 保存在当前目录，运行时缩略图保存在 `src/assets/monsters/`。

## Common prompt

```text
Use case: stylized-concept
Asset type: clean full-body cutout character for a mobile mini program monster gallery
Input images: Image 1 and Image 2 are visual style references only.
Style: one premium polished 3D kawaii emotional monster, soft vinyl toy with an opaque pearlescent jelly LOOK created only through painted lavender/blue/peach gradients and glossy highlights. Material must be physically fully opaque; no background visible through the body. Sophisticated grotesque-cute, rounded squishy proportions, expressive oversized eyes, subtle blush, tiny painted star speckles, clean soft lavender rim.
Composition: a single centered character, full body, front three-quarter view, strong readable silhouette, generous even padding, no cropping.
Backdrop: perfectly flat exact solid #00ff00 chroma-key background. No shadow, floor, texture, reflection, gradient, vignette, or lighting variation.
Constraints: absolutely no green anywhere in the character; no text, logo, watermark, frame, scenery, or extra character.
```

## Character subjects

1. `rainy-dog.png` — 下雨小狗怪

   ```text
   A round lavender-periwinkle puppy with very droopy long ears, huge watery eyes with two visible tears, small paws held near a glowing peach-pink heart emblem on its chest, and one small dark blue rain cloud floating directly above its head with three neat raindrops. Sad and vulnerable but comforting, never frightening.
   ```

2. `tough-cat.png` — 嘴硬猫猫怪

   ```text
   A compact lavender-gray cat with triangular ears, tail curled upward like an exclamation mark, arms folded tightly, face looking sideways with a stubborn unimpressed expression while one tiny hidden tear glints at the outer eye, small peach heart patch partly covered by its folded arms.
   ```

3. `overtime-jellyfish.png` — 加班水母怪

   ```text
   A floating bell-shaped jellyfish mascot with six short rounded tentacles, sleepy half-closed eyes, faint under-eye shadows, still glowing softly despite exhaustion, holding a tiny low-battery-shaped charm with no symbols or text.
   ```

4. `irritable-raccoon.png` — 暴躁浣熊怪

   ```text
   A chubby raccoon monster with a soft charcoal-purple eye mask and ringed tail, tense eyebrows, puffed cheeks, both paws covering its ears from overload, three small jagged irritation marks hovering above its head. Cute frustration, not aggression.
   ```

5. `stuck-penguin.png` — 原地企鹅怪

   ```text
   A small round periwinkle penguin frozen in indecision, feet close together inside two pale blue ice-cuff shapes attached to its ankles, flippers held uncertainly, worried wide eyes looking toward two opposite floating arrow-shaped charms with no symbols.
   ```

6. `defense-hedgehog.png` — 刺猬防御怪

   ```text
   A compact dusty-lavender hedgehog curled partly inward, soft rounded cream-and-mauve spines raised defensively like a protective halo, tiny paws clasped over a peach heart emblem, cautious eyes peeking out with one brow raised. Spines look soft and toy-like.
   ```

7. `busy-hamster.png` — 伪忙碌仓鼠怪

   ```text
   A plump caramel-and-cream hamster running frantically in a single purple exercise wheel, cheeks puffed, determined but frazzled eyes, clutching three tiny blank paper slips while the wheel spins, two small motion marks.
   ```

8. `perfection-polisher.png` — 完美主义打磨怪

   ```text
   A squat lavender-to-sky-blue jelly-blob monster with one oversized magnifying lens held before one eye and a small tan polishing block in the other hand, skeptical perfectionist expression, curled droplet antenna, tiny star speckles, a subtle peach heart in its chest.
   ```

9. `tomorrow-pigeon.png` — 明日鸽子怪

   ```text
   A plump blue-gray pigeon with a lavender pearlescent chest, guilty sideways eyes, one wing hiding a small rolled blank task paper behind its back, the other wing pointing toward a tiny floating crescent-moon charm as if saying later.
   ```

10. `collector-squirrel.png` — 收藏松鼠怪

    ```text
    A round warm caramel squirrel with an enormous curled pearlescent tail, cheeks full, bright possessive eyes, clutching far too many blank bookmarks, tiny scrolls and paper tabs against its chest; papers contain no text.
    ```

11. `shame-ostrich.png` — 怕丢脸鸵鸟怪

    ```text
    A small peach-and-lavender ostrich monster with a long curved neck folded down, face partly hidden behind both soft wings, one large worried eye peeking out, tall body and two short sturdy legs, three soft tail feathers fanned like a shield.
    ```

12. `three-minute-fox.png` — 三分钟热度狐狸怪

    ```text
    A compact orange-peach fox with one huge fluffy curled tail fading from a bright sparkling tip into a sleepy lavender base, enthusiastic front paws holding a tiny star spark while its face already looks slightly bored and tired, one ear perked and one drooping.
    ```

13. `anxiety-spinner.png` — 焦虑转圈怪

    ```text
    A round lavender-periwinkle creature whose long curled antenna loops around its body like an orbit, both hands clutching its cheeks, huge anxious eyes looking in opposite directions, one tiny sweat bead, violet orbit streaks and abstract question-shaped curves.
    ```

14. `review-hammer.png` — 复盘锤子怪

    ```text
    A squat indigo-lavender monster with a serious overthinking expression, holding one oversized soft toy hammer with a rounded peach head and purple handle, several tiny circular-arrow charms orbiting above its head, curled antenna shaped like a loop.
    ```

15. `comparison-octopus.png` — 比较章鱼怪

    ```text
    A plump lavender octopus with exactly eight rounded arms, worried darting eyes, six arms each holding a tiny blank phone-like tile or progress-bar-shaped charm, while two arms cover its own small peach heart emblem.
    ```

16. `life-reboot-giant.png` — 重启人生巨兽

    ```text
    A larger sleepy navy-to-periwinkle gentle giant with tiny legs and huge rounded body, low-battery tired eyes, a small packed lavender suitcase in one hand and a rolled blank map in the other, curled horn-like antenna and a peach heart glowing faintly in its chest.
    ```

## Extra UI mascot

`shelter-guide.png` — 引导吉祥物，不占 16 只图鉴名额。

```text
One friendly small jelly-ghost shelter guide: rounded bell-shaped body, one large open purple eye, one playful winking eye, happy smile, two small waving arms, glowing peach-pink heart emblem on its chest, curled droplet antenna. Premium polished 3D kawaii toy illustration with opaque lavender-to-sky-blue pearlescent gradients.
```
