import styled from "styled-components";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetLatestUsersQuery } from "@/redux/queries/userApi";

const Contributors = () => {
  const { data: latestUsers } = useGetLatestUsersQuery();
  const navigate = useNavigate();

  return (
    <Section>
      <div className="flex justify-center items-center flex-col py-20">
        <div className="marquee_header mb-6 text-center px-4">
          <p className="text-white font-bold text-3xl mb-2">Our Students</p>
          <p className="text-white/80 text-lg">
            Big thanks to all AUK students supporting our platform — welcome aboard!
          </p>
        </div>

        <StyledWrapper>
          <div className="marquee w-[400px] sm:w-[500px] md:w-[700px] lg:w-[1000px]">
            {/* Row 1 */}
            <div className="marquee__inner">
              <div className="marquee__group">
                {latestUsers?.map((user, i) => {
                  const username = user.username || "";
                  const initials =
                    username.length > 1
                      ? username[0].toUpperCase() + username[username.length - 1].toUpperCase()
                      : username[0]?.toUpperCase() || "";

                  const tier = getTierFromIndex(i);

                  return (
                    <GamerCard key={i} data-tier={tier}>
                      <div className="cardInner">
                        <div className="shine" />
                        <div className="topRow">
                          <div className="avatarWrap">
                            <div className="avatarRing" />
                            <div className="avatar">{initials}</div>
                            <div className="statusDot" />
                          </div>

                          <div className="badge" title="Student Supporter">
                            <Sparkles size={16} />
                            <span>Supporter</span>
                          </div>
                        </div>

                        <div className="midRow">
                          <span className="name">{user.name}</span>
                          <span className="tag">@{user.username || "student"}</span>
                        </div>

                        <div className="bottomRow">
                          <div className="xp">
                            <div className="xpMeta">
                              <span className="label">XP</span>
                              <span className="value">{calcXpFromIndex(i)}</span>
                            </div>
                            <div className="xpBar">
                              <div
                                className="xpFill"
                                style={{ width: `${calcXpFillFromIndex(i)}%` }}
                              />
                            </div>
                          </div>

                          <div className="rankPill" title="Rank">
                            <Star size={16} />
                            <span>{tier.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    </GamerCard>
                  );
                })}
              </div>

              <div className="marquee__group">
                {latestUsers?.map((user, i) => {
                  const username = user.username || "";
                  const initials =
                    username.length > 1
                      ? username[0].toUpperCase() + username[username.length - 1].toUpperCase()
                      : username[0]?.toUpperCase() || "";

                  const tier = getTierFromIndex(i + (latestUsers?.length || 0));

                  return (
                    <GamerCard key={i + latestUsers.length} data-tier={tier}>
                      <div className="cardInner">
                        <div className="shine" />
                        <div className="topRow">
                          <div className="avatarWrap">
                            <div className="avatarRing" />
                            <div className="avatar">{initials}</div>
                            <div className="statusDot" />
                          </div>

                          <div className="badge" title="Student Supporter">
                            <Sparkles size={16} />
                            <span>Supporter</span>
                          </div>
                        </div>

                        <div className="midRow">
                          <span className="name">{user.name}</span>
                          <span className="tag">@{user.username || "student"}</span>
                        </div>

                        <div className="bottomRow">
                          <div className="xp">
                            <div className="xpMeta">
                              <span className="label">XP</span>
                              <span className="value">{calcXpFromIndex(i)}</span>
                            </div>
                            <div className="xpBar">
                              <div
                                className="xpFill"
                                style={{ width: `${calcXpFillFromIndex(i)}%` }}
                              />
                            </div>
                          </div>

                          <div className="rankPill" title="Rank">
                            <Star size={16} />
                            <span>{tier.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    </GamerCard>
                  );
                })}
              </div>
            </div>

            {/* Row 2 (reverse) */}
            <div className="marquee__inner marquee__inner--second">
              <div className="marquee__group">
                {latestUsers?.map((user, i) => {
                  const username = user.username || "";
                  const initials =
                    username.length > 1
                      ? username[0].toUpperCase() + username[username.length - 1].toUpperCase()
                      : username[0]?.toUpperCase() || "";

                  const tier = getTierFromIndex(i + 7);

                  return (
                    <GamerCard key={`r2-${i}`} data-tier={tier}>
                      <div className="cardInner">
                        <div className="shine" />
                        <div className="topRow">
                          <div className="avatarWrap">
                            <div className="avatarRing" />
                            <div className="avatar">{initials}</div>
                            <div className="statusDot" />
                          </div>

                          <div className="badge" title="Student Supporter">
                            <Sparkles size={16} />
                            <span>Supporter</span>
                          </div>
                        </div>

                        <div className="midRow">
                          <span className="name">{user.name}</span>
                          <span className="tag">@{user.username || "student"}</span>
                        </div>

                        <div className="bottomRow">
                          <div className="xp">
                            <div className="xpMeta">
                              <span className="label">XP</span>
                              <span className="value">{calcXpFromIndex(i + 7)}</span>
                            </div>
                            <div className="xpBar">
                              <div
                                className="xpFill"
                                style={{ width: `${calcXpFillFromIndex(i + 7)}%` }}
                              />
                            </div>
                          </div>

                          <div className="rankPill" title="Rank">
                            <Star size={16} />
                            <span>{tier.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    </GamerCard>
                  );
                })}
              </div>

              <div className="marquee__group">
                {latestUsers?.map((user, i) => {
                  const username = user.username || "";
                  const initials =
                    username.length > 1
                      ? username[0].toUpperCase() + username[username.length - 1].toUpperCase()
                      : username[0]?.toUpperCase() || "";

                  const tier = getTierFromIndex(i + 7 + (latestUsers?.length || 0));

                  return (
                    <GamerCard key={`r2-${i + latestUsers.length}`} data-tier={tier}>
                      <div className="cardInner">
                        <div className="shine" />
                        <div className="topRow">
                          <div className="avatarWrap">
                            <div className="avatarRing" />
                            <div className="avatar">{initials}</div>
                            <div className="statusDot" />
                          </div>

                          <div className="badge" title="Student Supporter">
                            <Sparkles size={16} />
                            <span>Supporter</span>
                          </div>
                        </div>

                        <div className="midRow">
                          <span className="name">{user.name}</span>
                          <span className="tag">@{user.username || "student"}</span>
                        </div>

                        <div className="bottomRow">
                          <div className="xp">
                            <div className="xpMeta">
                              <span className="label">XP</span>
                              <span className="value">{calcXpFromIndex(i + 7)}</span>
                            </div>
                            <div className="xpBar">
                              <div
                                className="xpFill"
                                style={{ width: `${calcXpFillFromIndex(i + 7)}%` }}
                              />
                            </div>
                          </div>

                          <div className="rankPill" title="Rank">
                            <Star size={16} />
                            <span>{tier.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    </GamerCard>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <Button
              onClick={() => navigate("/register")}
              variant="default"
              className="rounded-full bg-tomato hover:bg-tomato/90 shadow-[0_0_16px_rgba(255,99,71,0.65)] text-white px-6">
              Join the wolfpack <ArrowRight />
            </Button>
          </div>
        </StyledWrapper>
      </div>
    </Section>
  );
};

/** little deterministic “gamification” helpers (no backend needed) */
function calcXpFromIndex(i) {
  // 1200–5900-ish range, deterministic
  return 1200 + ((i * 347) % 4700);
}
function calcXpFillFromIndex(i) {
  // 30%–95%
  return 30 + ((i * 13) % 66);
}
function getTierFromIndex(i) {
  const tiers = ["bronze", "silver", "gold", "platinum"];
  return tiers[i % tiers.length];
}

/** Background wrapper */
const Section = styled.section`
  background: radial-gradient(900px 500px at 50% 0%, rgba(255, 99, 71, 0.12), transparent 60%),
    radial-gradient(700px 450px at 15% 10%, rgba(124, 58, 237, 0.15), transparent 55%),
    radial-gradient(700px 450px at 85% 20%, rgba(59, 130, 246, 0.12), transparent 55%), #0a0a0a;
`;

/** Marquee + layout */
const StyledWrapper = styled.div`
  .marquee {
    overflow: hidden;
    -webkit-mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 10%,
      black 90%,
      transparent 100%
    );
    mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
  }

  .marquee__inner {
    display: flex;
    gap: 14px;
    width: max-content;
    animation: marquee 80s linear infinite;
    margin-bottom: 18px;
    will-change: transform;
  }

  .marquee__inner--second {
    animation: marquee 80s linear infinite reverse;
  }

  .marquee__group {
    display: flex;
    gap: 14px;
  }

  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .marquee__inner,
    .marquee__inner--second {
      animation: none;
      transform: none;
    }
  }
`;

/** Modern gamified card */
const GamerCard = styled.div`
  position: relative;
  min-width: 260px;
  border-radius: 18px;
  padding: 1px; /* for gradient border */
  background: linear-gradient(
    135deg,
    rgba(255, 99, 71, 0.55),
    rgba(124, 58, 237, 0.55),
    rgba(59, 130, 246, 0.45)
  );
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
  transform: translateZ(0);
  transition: transform 200ms ease, box-shadow 200ms ease, filter 200ms ease;

  .cardInner {
    position: relative;
    overflow: hidden;
    border-radius: 17px;
    background: rgba(12, 12, 14, 0.72);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 14px 14px 12px;
  }

  /* moving “shine” */
  .shine {
    position: absolute;
    inset: -2px;
    background: radial-gradient(300px 140px at 15% 10%, rgba(255, 255, 255, 0.14), transparent 60%),
      radial-gradient(250px 140px at 80% 30%, rgba(255, 99, 71, 0.12), transparent 55%),
      radial-gradient(240px 140px at 40% 90%, rgba(124, 58, 237, 0.12), transparent 55%);
    pointer-events: none;
  }

  .topRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }

  .avatarWrap {
    position: relative;
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .avatarRing {
    position: absolute;
    inset: -2px;
    border-radius: 999px;
    background: conic-gradient(
      from 180deg,
      rgba(255, 99, 71, 0.9),
      rgba(124, 58, 237, 0.9),
      rgba(59, 130, 246, 0.9),
      rgba(255, 99, 71, 0.9)
    );
    filter: blur(0.2px);
  }

  .avatar {
    position: relative;
    width: 42px;
    height: 42px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    color: rgba(255, 255, 255, 0.95);
    font-weight: 800;
    letter-spacing: 0.5px;
    background: radial-gradient(18px 18px at 30% 30%, rgba(255, 255, 255, 0.18), transparent 60%),
      linear-gradient(135deg, rgba(255, 99, 71, 0.9), rgba(124, 58, 237, 0.85));
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
  }

  .statusDot {
    position: absolute;
    right: -2px;
    bottom: -2px;
    width: 12px;
    height: 12px;
    border-radius: 999px;
    background: rgba(34, 197, 94, 0.95);
    box-shadow: 0 0 0 3px rgba(12, 12, 14, 0.9), 0 0 18px rgba(34, 197, 94, 0.35);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.92);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .midRow {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 10px;
  }

  .name {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 800;
    font-size: 15px;
    line-height: 1.2;
    letter-spacing: 0.2px;
  }

  .tag {
    color: rgba(255, 255, 255, 0.55);
    font-weight: 600;
    font-size: 12px;
  }

  .bottomRow {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 10px;
  }

  .xp {
    flex: 1;
    min-width: 150px;
  }

  .xpMeta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .xpMeta .label {
    font-size: 11px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 0.6px;
  }

  .xpMeta .value {
    font-size: 12px;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.9);
  }

  .xpBar {
    height: 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }

  .xpFill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      rgba(255, 99, 71, 0.95),
      rgba(124, 58, 237, 0.9),
      rgba(59, 130, 246, 0.85)
    );
    box-shadow: 0 0 24px rgba(255, 99, 71, 0.25);
    transition: width 250ms ease;
  }

  .rankPill {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    letter-spacing: 0.3px;
  }

  /* Tier accents */
  &[data-tier="bronze"] {
    background: linear-gradient(135deg, rgba(255, 99, 71, 0.55), rgba(245, 158, 11, 0.45));
  }
  &[data-tier="silver"] {
    background: linear-gradient(135deg, rgba(148, 163, 184, 0.55), rgba(59, 130, 246, 0.35));
  }
  &[data-tier="gold"] {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.6), rgba(255, 99, 71, 0.5));
  }
  &[data-tier="platinum"] {
    background: linear-gradient(135deg, rgba(124, 58, 237, 0.6), rgba(59, 130, 246, 0.45));
  }

  &:hover {
    transform: translateY(-3px) scale(1.01);
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55);
    filter: saturate(1.05);
  }

  @media (max-width: 420px) {
    min-width: 240px;
  }
`;

export default Contributors;
