"use client";

import { ArrowRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetLatestUsersQuery } from "@/redux/queries/userApi";

function getInitials(name: string, username: string) {
  if (username && username.length > 1) {
    return (username[0] + username[username.length - 1]).toUpperCase();
  }
  const parts = name?.trim().split(" ") ?? [];
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name?.slice(0, 2).toUpperCase() ?? "?";
}

const AVATAR_COLORS = [
  { bg: "#0ea5e920", text: "#38bdf8", border: "#0ea5e930" },
  { bg: "#8b5cf620", text: "#a78bfa", border: "#8b5cf630" },
  { bg: "#10b98120", text: "#34d399", border: "#10b98130" },
  { bg: "#f59e0b20", text: "#fbbf24", border: "#f59e0b30" },
  { bg: "#f43f5e20", text: "#fb7185", border: "#f43f5e30" },
  { bg: "#14b8a620", text: "#2dd4bf", border: "#14b8a630" },
];

const styles = `
  @keyframes scroll-left {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes scroll-right {
    0%   { transform: translateX(-50%); }
    100% { transform: translateX(0); }
  }
  .marquee-track-left {
    display: flex;
    gap: 12px;
    width: max-content;
    animation: scroll-left 55s linear infinite;
    will-change: transform;
  }
  .marquee-track-right {
    display: flex;
    gap: 12px;
    width: max-content;
    animation: scroll-right 60s linear infinite;
    will-change: transform;
  }
  .marquee-track-left:hover,
  .marquee-track-right:hover {
    animation-play-state: paused;
  }
  .marquee-card {
    min-width: 180px;
    background: #111;
    border: 0.5px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 14px;
    flex-shrink: 0;
  }
  @media (min-width: 480px) {
    .marquee-card { min-width: 220px; padding: 16px; }
  }
  @media (min-width: 768px) {
    .marquee-card { min-width: 260px; padding: 20px; border-radius: 18px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .marquee-track-left,
    .marquee-track-right { animation: none; }
  }
`;

function UserCard({ user, index }: { user: any; index: number }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials = getInitials(user.name, user.username);

  return (
    <div className="marquee-card">
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: color.bg,
              border: `0.5px solid ${color.border}`,
              color: color.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "15px",
              fontWeight: 500,
            }}>
            {initials}
          </div>
          <span
            style={{
              position: "absolute",
              bottom: 1,
              right: 1,
              width: "11px",
              height: "11px",
              background: "#22c55e",
              borderRadius: "50%",
              border: "2px solid #111",
            }}
          />
        </div>

        {/* Info */}
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontSize: "15px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.9)",
              margin: 0,
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
            {user.name}
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.35)",
              margin: "4px 0 0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
            @{user.username || "student"}
          </p>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({
  users,
  offset = 0,
  reverse = false,
}: {
  users: any[];
  offset?: number;
  reverse?: boolean;
}) {
  return (
    <div style={{ overflow: "hidden", marginBottom: "14px" }}>
      <div className={reverse ? "marquee-track-right" : "marquee-track-left"}>
        {[0, 1].map((dupe) =>
          users.map((user, i) => (
            <UserCard key={`${dupe}-${i}`} user={user} index={i + offset + dupe * users.length} />
          )),
        )}
      </div>
    </div>
  );
}

const Contributors = () => {
  const { data: latestUsers } = useGetLatestUsersQuery();
  const navigate = useNavigate();

  if (!latestUsers?.length) return null;

  return (
    <section style={{ padding: "80px 0", background: "#0a0a0a", overflow: "hidden" }}>
      <style>{styles}</style>

      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: "48px", padding: "0 48px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
            fontWeight: 500,
            color: "#fb923c",
            background: "rgba(249,115,22,0.1)",
            border: "0.5px solid rgba(249,115,22,0.2)",
            borderRadius: "99px",
            padding: "3px 10px",
            marginBottom: "12px",
          }}>
          <Users size={10} />
          Our students
        </div>
        <h2
          style={{
            fontSize: "clamp(22px, 4vw, 30px)",
            fontWeight: 500,
            color: "#fff",
            margin: "0 0 8px",
          }}>
          The AUK community
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.4)",
            margin: 0,
            maxWidth: "400px",
            marginInline: "auto",
            lineHeight: 1.6,
          }}>
          Big thanks to all AUK students supporting the platform — welcome aboard.
        </p>
      </div>

      {/* Marquee rows */}
      <div
        className="xl:mx-96"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}>
        <MarqueeRow users={latestUsers} offset={0} reverse={false} />
        <MarqueeRow users={latestUsers} offset={3} reverse={true} />
        <MarqueeRow users={latestUsers} offset={0} reverse={false} />
      </div>

      {/* CTA */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
        <button
          onClick={() => navigate("/register")}
          className="rounded-full bg-tomato shadow-[0_0_10px_tomato] border-0 hover:bg-tomato/90 text-white "
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            fontWeight: 500,
            color: "#fff",
            // background: "tomato",
            border: "none",
            borderRadius: "99px",
            padding: "10px 22px",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
          Join the community
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
};

export default Contributors;
