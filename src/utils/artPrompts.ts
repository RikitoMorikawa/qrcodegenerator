// アートQRコード生成用の特化プロンプト

export function generateCatArtPrompt(userPrompt: string, styleType: string): string {
  const styleModifier = getStyleModifier(styleType);

  // 猫関連のキーワードを検出
  const isCatRelated = /cat|猫|ねこ|kitten|子猫|feline/i.test(userPrompt);

  if (isCatRelated) {
    return `Create a stunning, vibrant digital artwork featuring adorable cats in a colorful, dynamic composition perfect for QR code center placement.

🐱 CENTRAL CAT COMPOSITION:
${styleModifier ? `Style: ${styleModifier}` : "Vibrant, playful digital art with rich colors"}
- Feature 2-3 adorable cats as the main subjects in the center
- Show cats in dynamic, playful poses: jumping, running, or playing together
- Each cat should have distinct, beautiful markings: tabby stripes, calico patches, tuxedo patterns
- Expressive, bright eyes in golden amber, emerald green, or sapphire blue
- Soft, fluffy fur with realistic texture and beautiful lighting effects
- Cats should appear joyful, energetic, and full of personality

🌈 VIBRANT COLOR SCHEME:
- Primary colors: Bright turquoise (#40E0D0), warm coral (#FF7F50), vibrant pink (#FF69B4)
- Secondary colors: Golden yellow (#FFD700), lime green (#32CD32), lavender (#E6E6FA)
- Rich, saturated colors throughout the composition
- Smooth color gradients and transitions
- Colorful geometric elements scattered in the background
- Rainbow-like color harmony with both warm and cool tones

✨ BACKGROUND & EFFECTS:
- Colorful abstract geometric patterns (squares, rectangles, circles)
- Soft bokeh effects and light particles
- Gradient backgrounds with multiple color layers
- Magical sparkles and light rays
- Dreamy, whimsical atmosphere
- Multiple depth layers for visual richness

🎨 COMPOSITION FOCUS:
- Design optimized for circular center placement in QR code
- Main subjects (cats) concentrated in the center area
- Background elements that complement but don't compete with cats
- Balanced composition with visual flow toward the center
- Rich detail in the center, softer elements toward edges

🔧 TECHNICAL SPECIFICATIONS:
- 1024x1024 resolution with crisp, high-quality rendering
- Professional digital art quality with smooth rendering
- Rich color saturation and vibrant palette
- Perfect for QR code artistic integration
- Center-focused composition design

Create the most charming, colorful cat artwork that will be perfect as the centerpiece of an artistic QR code!`;
  }

  // 一般的なアートプロンプト
  return `Create a vibrant, colorful artistic masterpiece featuring "${userPrompt}" with rich details and dynamic composition.

🎨 ARTISTIC VISION - "${userPrompt}" Theme:
${styleModifier ? `Style: ${styleModifier}` : "Vibrant, colorful digital art with rich details"}
- Feature "${userPrompt}" as the main subject with incredible detail and personality
- Use a rich, vibrant color palette: bright blues, warm oranges, vivid greens, soft pinks, golden yellows
- Create dynamic lighting effects and colorful backgrounds
- Add magical, whimsical elements that enhance the "${userPrompt}" theme
- Include colorful geometric patterns, gradients, and artistic flourishes
- Use multiple layers of color and texture for visual depth
- Make it feel alive, energetic, and full of character

🌈 COLOR & COMPOSITION:
- Dominant colors: Bright cyan, warm orange, vibrant pink, golden yellow, emerald green
- Create smooth color transitions and gradients
- Add colorful bokeh effects, light rays, or magical sparkles
- Use complementary colors for maximum visual impact
- Ensure the composition is balanced but dynamic
- Include both warm and cool tones for richness

🔧 TECHNICAL EXCELLENCE:
- 1024x1024 resolution with crisp details
- Professional digital art quality with smooth rendering
- Rich saturation and vibrant colors throughout
- Multiple layers of visual interest
- Perfect for artistic QR code integration

Create the most beautiful, colorful, and captivating "${userPrompt}" artwork that will make people smile when they see it!`;
}

function getStyleModifier(styleType: string): string {
  const styleModifiers: Record<string, string> = {
    normal: "",
    cute: "kawaii, cute style, adorable, soft features, pastel colors, charming, sweet",
    cool: "cool design, sleek, confident, bold colors, modern style, edgy, dynamic",
    elegant: "elegant design, sophisticated, refined, graceful, classy, luxurious, artistic",
    playful: "playful style, fun, energetic, vibrant colors, cheerful, whimsical, joyful",
    retro: "retro style, vintage design, nostalgic, classic colors, old-school aesthetic, timeless",
  };

  return styleModifiers[styleType] || "";
}
