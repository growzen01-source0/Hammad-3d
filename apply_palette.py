import os
import re

def update_index_html():
    with open("index.html", "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace("#060709", "#0D0D14")
    content = content.replace("#10f48e", "#8B5CF6")
    content = content.replace("rgba(16, 244, 142,", "rgba(139, 92, 246,")
    content = content.replace("rgba(16,244,142,", "rgba(139,92,246,")
    content = content.replace("selection:bg-[#10f48e]/25 selection:text-[#10f48e]", "selection:bg-[#8B5CF6]/30 selection:text-[#22D3EE]")
    content = content.replace("selection:bg-[#8B5CF6]/25 selection:text-[#8B5CF6]", "selection:bg-[#8B5CF6]/30 selection:text-[#22D3EE]")

    with open("index.html", "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated index.html")

def update_index_css():
    with open("src/index.css", "r", encoding="utf-8") as f:
        content = f.read()

    # Background
    content = content.replace("#060709", "#0D0D14")
    
    # Glows & Colors
    content = content.replace("rgba(16, 244, 142,", "rgba(139, 92, 246,")
    content = content.replace("rgba(16,244,142,", "rgba(139,92,246,")
    content = content.replace("#10f48e", "#8B5CF6")
    content = content.replace("rgba(52, 211, 153, 0.4)", "rgba(34, 211, 238, 0.4)")
    
    # Replace green laser / holo glow references if any
    content = content.replace("rgba(14, 17, 23, 0.72)", "rgba(18, 18, 30, 0.75)")
    content = content.replace("rgba(18, 24, 32, 0.85)", "rgba(22, 22, 36, 0.85)")

    with open("src/index.css", "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated src/index.css")

def update_app_tsx():
    with open("src/App.tsx", "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace("#060709", "#0D0D14")
    content = content.replace("selection:bg-[#10f48e]/25 selection:text-[#10f48e]", "selection:bg-[#8B5CF6]/30 selection:text-[#22D3EE]")

    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated src/App.tsx")

def update_data():
    with open("src/data/agencyData.ts", "r", encoding="utf-8") as f:
        content = f.read()

    # Replace service card backdrop gradients with purple & cyan luxury gradients
    replacements = [
        ("from-emerald-500/20 via-teal-500/10 to-transparent", "from-[#8B5CF6]/25 via-[#22D3EE]/10 to-transparent"),
        ("from-lime-400/20 via-emerald-500/10 to-transparent", "from-[#22D3EE]/25 via-[#8B5CF6]/15 to-transparent"),
        ("from-teal-400/20 via-green-500/10 to-transparent", "from-[#8B5CF6]/25 via-violet-500/10 to-transparent"),
        ("from-emerald-400/20 via-cyan-500/10 to-transparent", "from-[#8B5CF6]/20 via-[#22D3EE]/20 to-transparent"),
        ("from-green-500/20 via-emerald-600/10 to-transparent", "from-[#22D3EE]/20 via-[#8B5CF6]/15 to-transparent"),
        ("from-emerald-400/20 via-lime-500/10 to-transparent", "from-[#8B5CF6]/25 via-fuchsia-500/10 to-transparent"),
        ("from-teal-500/20 via-emerald-400/10 to-transparent", "from-[#22D3EE]/20 via-[#8B5CF6]/10 to-transparent"),
        ("from-lime-500/20 via-green-400/10 to-transparent", "from-[#8B5CF6]/20 via-[#22D3EE]/15 to-transparent"),
    ]
    for old, new in replacements:
        content = content.replace(old, new)

    with open("src/data/agencyData.ts", "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated src/data/agencyData.ts")

def update_growth_model():
    with open("src/components/ThreeGrowthModel.tsx", "r", encoding="utf-8") as f:
        content = f.read()

    # Channel colors
    content = content.replace("{ name: 'Paid Social & Meta Ads', share: 42, color: '#10f48e', growth: '+340%', volume: '$357K' }",
                            "{ name: 'Paid Social & Meta Ads', share: 42, color: '#8B5CF6', growth: '+340%', volume: '$357K' }")
    content = content.replace("{ name: 'Google High-Intent Search', share: 26, color: '#38bdf8', growth: '+280%', volume: '$221K' }",
                            "{ name: 'Google High-Intent Search', share: 26, color: '#22D3EE', growth: '+280%', volume: '$221K' }")
    content = content.replace("{ name: 'Conversion Rate Opt (CRO)', share: 20, color: '#34d399', growth: '+410%', volume: '$170K' }",
                            "{ name: 'Conversion Rate Opt (CRO)', share: 20, color: '#A78BFA', growth: '+410%', volume: '$170K' }")
    content = content.replace("{ name: 'Omnichannel Retargeting', share: 12, color: '#a78bfa', growth: '+190%', volume: '$102K' }",
                            "{ name: 'Omnichannel Retargeting', share: 12, color: '#06B6D4', growth: '+190%', volume: '$102K' }")

    # Canvas Gradients
    content = content.replace("rgba(16, 244, 142, 0.07)", "rgba(139, 92, 246, 0.09)")
    content = content.replace("rgba(6, 17, 12, 0.45)", "rgba(18, 16, 32, 0.45)")
    content = content.replace("rgba(6, 7, 9, 0.98)", "rgba(13, 13, 20, 0.98)")

    content = content.replace("rgba(16, 244, 142, 0.35)", "rgba(139, 92, 246, 0.4)")
    content = content.replace("rgba(56, 189, 248, 0.1)", "rgba(34, 211, 238, 0.15)")
    content = content.replace("rgba(16, 244, 142, 0.0)", "rgba(139, 92, 246, 0.0)")

    # Line stroke gradient
    content = content.replace("strokeGrad.addColorStop(0, '#10f48e');", "strokeGrad.addColorStop(0, '#8B5CF6');")
    content = content.replace("strokeGrad.addColorStop(0.7, '#34d399');", "strokeGrad.addColorStop(0.5, '#A78BFA');")
    content = content.replace("strokeGrad.addColorStop(1, '#38bdf8');", "strokeGrad.addColorStop(1, '#22D3EE');")

    # Bars & Donut
    content = content.replace("isHovered ? '#4ade80' : '#10f48e'", "isHovered ? '#22D3EE' : '#8B5CF6'")
    content = content.replace("rgba(16, 244, 142, 0.15)", "rgba(139, 92, 246, 0.2)")
    content = content.replace("rgba(16, 244, 142, 0.4)", "rgba(139, 92, 246, 0.4)")
    content = content.replace("rgba(16, 244, 142, 0.2)", "rgba(34, 211, 238, 0.3)")
    content = content.replace("ctx.fillStyle = '#060a0f';", "ctx.fillStyle = '#10101C';")

    # Peak styles
    content = content.replace("isPeak ? '#10f48e' : (isHovered ? '#38bdf8' : '#071710')", "isPeak ? '#22D3EE' : (isHovered ? '#8B5CF6' : '#141424')")
    content = content.replace("isPeak ? '#ffffff' : (isHovered ? '#10f48e' : '#10f48e')", "isPeak ? '#ffffff' : (isHovered ? '#22D3EE' : '#8B5CF6')")
    content = content.replace("isPeak ? '#10f48e' : '#38bdf8'", "isPeak ? '#22D3EE' : '#8B5CF6'")

    # General replacements for colors
    content = content.replace("#060709", "#0D0D14")
    content = content.replace("#0d1017", "#151524")
    content = content.replace("#070b10", "#121220")
    content = content.replace("#10f48e", "#8B5CF6")
    content = content.replace("rgba(16, 244, 142,", "rgba(139, 92, 246,")
    content = content.replace("rgba(16,244,142,", "rgba(139,92,246,")

    # Legend & text
    content = content.replace("text-black font-bold shadow-[0_0_12px_rgba(139,92,246,0.5)]", "text-white font-bold bg-linear-to-r from-[#8B5CF6] to-[#22D3EE] shadow-[0_0_15px_rgba(139,92,246,0.5)]")

    with open("src/components/ThreeGrowthModel.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated src/components/ThreeGrowthModel.tsx")

def update_three_hero_canvas():
    with open("src/components/ThreeHeroCanvas.tsx", "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace("0x10f48e", "0x8B5CF6")
    content = content.replace("0x00d075", "0x22D3EE")
    content = content.replace("0x34d399", "0x22D3EE")
    content = content.replace("0x060709", "0x0D0D14")
    content = content.replace("#10f48e", "#8B5CF6")
    content = content.replace("#34d399", "#22D3EE")
    content = content.replace("#00d075", "#22D3EE")
    content = content.replace("#060709", "#0D0D14")

    with open("src/components/ThreeHeroCanvas.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated src/components/ThreeHeroCanvas.tsx")

def update_global_3d():
    for filename in ["src/components/Global3DCanvas.tsx", "src/components/Global3DBackground.tsx"]:
        with open(filename, "r", encoding="utf-8") as f:
            content = f.read()

        content = content.replace("0x10f48e", "0x8B5CF6")
        content = content.replace("0x00d075", "0x22D3EE")
        content = content.replace("0x34d399", "0x22D3EE")
        content = content.replace("0x060709", "0x0D0D14")
        content = content.replace("#10f48e", "#8B5CF6")
        content = content.replace("#060709", "#0D0D14")
        content = content.replace("rgba(16, 244, 142,", "rgba(139, 92, 246,")
        content = content.replace("rgba(16,244,142,", "rgba(139,92,246,")

        with open(filename, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {filename}")

def update_all_components():
    components = [
        "src/components/Navbar.tsx",
        "src/components/HeroSection.tsx",
        "src/components/AboutSection.tsx",
        "src/components/ServicesSection.tsx",
        "src/components/ServiceCard.tsx",
        "src/components/PortfolioSection.tsx",
        "src/components/PricingSection.tsx",
        "src/components/BookingSection.tsx",
        "src/components/TestimonialsSection.tsx",
        "src/components/ContactSection.tsx",
        "src/components/Footer.tsx",
        "src/components/FloatingActions.tsx",
        "src/components/CustomCursor.tsx",
        "src/components/PromoModal.tsx",
        "src/components/MagneticButton.tsx",
    ]

    for filename in components:
        with open(filename, "r", encoding="utf-8") as f:
            content = f.read()

        # Backgrounds
        content = content.replace("#060709", "#0D0D14")
        content = content.replace("#0c1219", "#121220")
        content = content.replace("#070b10", "#11111E")
        content = content.replace("#060a0f", "#10101C")
        content = content.replace("#0d1017", "#151526")

        # Gradients from green to emerald -> from rich purple to bright cyan
        content = content.replace("from-[#10f48e] to-emerald-400", "from-[#8B5CF6] via-[#A78BFA] to-[#22D3EE]")
        content = content.replace("from-[#10f48e] to-[#00d075]", "from-[#8B5CF6] to-[#22D3EE]")
        content = content.replace("from-[#10f48e] via-emerald-400 to-[#00d075]", "from-[#8B5CF6] via-[#A78BFA] to-[#22D3EE]")
        content = content.replace("from-emerald-400 to-[#10f48e]", "from-[#22D3EE] to-[#8B5CF6]")
        content = content.replace("to-emerald-400", "to-[#22D3EE]")
        content = content.replace("to-emerald-500", "to-[#22D3EE]")
        content = content.replace("from-emerald-500", "from-[#8B5CF6]")
        content = content.replace("text-emerald-400", "text-[#22D3EE]")
        content = content.replace("text-emerald-500", "text-[#8B5CF6]")
        content = content.replace("bg-emerald-400", "bg-[#22D3EE]")
        content = content.replace("bg-emerald-500", "bg-[#8B5CF6]")

        # Glows
        content = content.replace("rgba(16, 244, 142,", "rgba(139, 92, 246,")
        content = content.replace("rgba(16,244,142,", "rgba(139,92,246,")

        # Primary hex
        content = content.replace("#10f48e", "#8B5CF6")
        content = content.replace("#00d075", "#22D3EE")
        content = content.replace("#34d399", "#22D3EE")

        # Buttons that had text-[#060709] on glowing background
        # On purple/cyan gradient or #8B5CF6, white text or deep charcoal #0D0D14
        # E.g. bg-linear-to-r from-[#8B5CF6] to-[#22D3EE] text-[#0D0D14] font-black or text-white font-bold
        # Both are very readable; let us ensure high-contrast
        content = content.replace("bg-[#8B5CF6] text-[#0D0D14]", "bg-[#8B5CF6] text-white")
        content = content.replace("hover:bg-[#8B5CF6] hover:text-[#0D0D14]", "hover:bg-[#8B5CF6] hover:text-white")

        with open(filename, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {filename}")

if __name__ == "__main__":
    update_index_html()
    update_index_css()
    update_app_tsx()
    update_data()
    update_growth_model()
    update_three_hero_canvas()
    update_global_3d()
    update_all_components()
    print("ALL COLOR SCHEME UPDATES APPLIED!")
