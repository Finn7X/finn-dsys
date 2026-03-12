import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "Finn Days"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const tags = ["Next.js", "React", "TypeScript", "Web Dev", "Open Source"]

export default function OgImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "linear-gradient(135deg, #9333ea 0%, #2563eb 100%)",
                    padding: "60px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: 1,
                    }}
                >
                    <div
                        style={{
                            fontSize: 64,
                            fontWeight: 700,
                            color: "#ffffff",
                            marginBottom: 20,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Finn Days
                    </div>
                    <div
                        style={{
                            fontSize: 24,
                            fontWeight: 400,
                            color: "rgba(255, 255, 255, 0.85)",
                            textAlign: "center",
                            maxWidth: 800,
                            lineHeight: 1.5,
                            marginBottom: 40,
                        }}
                    >
                        Exploring technology, sharing knowledge, and documenting
                        my journey in web development
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 12,
                            justifyContent: "center",
                        }}
                    >
                        {tags.map((tag) => (
                            <div
                                key={tag}
                                style={{
                                    fontSize: 18,
                                    color: "#ffffff",
                                    background: "rgba(255, 255, 255, 0.15)",
                                    borderRadius: 9999,
                                    padding: "8px 20px",
                                    fontWeight: 500,
                                }}
                            >
                                {tag}
                            </div>
                        ))}
                    </div>
                </div>
                <div
                    style={{
                        fontSize: 16,
                        color: "rgba(255, 255, 255, 0.5)",
                        marginTop: 20,
                    }}
                >
                    finn7x.com
                </div>
            </div>
        ),
        { ...size },
    )
}
