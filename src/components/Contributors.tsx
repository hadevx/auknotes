import styled from "styled-components";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const students = [
  { name: "Ali Kareem", major: "CPEG", contributions: 5 },
  { name: "Layla Mansour", major: "ELEG", contributions: 3 },
  { name: "Omar Haddad", major: "Business", contributions: 4 },
  { name: "Noor AlSabah", major: "Biology", contributions: 2 },
  { name: "Sara AlYousef", major: "CSIS", contributions: 6 },
  { name: "Hamad AlFarsi", major: "ELEG", contributions: 1 },
  { name: "Maya AlHassan", major: "Physics", contributions: 3 },
  { name: "Zayd AlOmar", major: "Mathematics", contributions: 4 },
];

const Contributors = () => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-center items-center flex-col py-20 bg-neutral-900">
      <div className="marquee_header mb-5">
        <p className="text-white font-bold text-center text-3xl mb-2">Contributors</p>
        <p className="text-white/80 text-lg text-center px-10">
          Big thanks to all AUK students who share their notes with us.
        </p>
      </div>

      <StyledWrapper>
        <div className="marquee w-[400px] sm:w-[500px] md:w-[700px] lg:w-[1000px]">
          {/* First Row */}
          <div className="marquee__inner">
            <div className="marquee__group">
              {students.map((s, i) => (
                <BlurredCard key={i}>
                  <span className="blurred-name">{s.name}</span>
                  <br />
                  <span className="blurred-major">{s.major}</span>
                  <br />
                  {s.contributions} resources
                </BlurredCard>
              ))}
            </div>
            <div className="marquee__group">
              {students.map((s, i) => (
                <BlurredCard key={i + students.length}>
                  <span className="blurred-name">{s.name}</span>
                  <br />
                  <span className="blurred-major">{s.major}</span>
                  <br />
                  {s.contributions} resources
                </BlurredCard>
              ))}
            </div>
          </div>

          {/* Second Row */}
          <div className="marquee__inner marquee__inner--second">
            <div className="marquee__group">
              {students.map((s, i) => (
                <BlurredCard key={i}>
                  <span className="blurred-name">{s.name}</span>
                  <br />
                  <span className="blurred-major">{s.major}</span>
                  <br />
                  {s.contributions} resources
                </BlurredCard>
              ))}
            </div>
            <div className="marquee__group">
              {students.map((s, i) => (
                <BlurredCard key={i + students.length}>
                  <span className="blurred-name">{s.name}</span>
                  <br />
                  <span className="blurred-major">{s.major}</span>
                  <br />
                  {s.contributions} resources
                </BlurredCard>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            onClick={() => navigate("/contact")}
            variant="default"
            className="rounded-full bg-tomato hover:bg-tomato/90 shadow-[0_0_10px_tomato] text-white">
            Become a Contributor <ArrowRight />
          </Button>
        </div>
      </StyledWrapper>
    </div>
  );
};

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
    gap: 5px;
    width: max-content;
    animation: marquee 90s linear infinite;
    margin-bottom: 20px;
  }

  .marquee__inner--second {
    animation: marquee 90s linear infinite reverse;
  }

  .marquee__group {
    display: flex;
    gap: 5px;
  }

  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
`;

const BlurredCard = styled.span`
  white-space: nowrap;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.3);
  color: black;
  padding: 20px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.4;
  position: relative;
  overflow: hidden;
  width: 140px;

  /* Subtle shimmer effect */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 80%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.6), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 120%;
    }
  }

  .blurred-name,
  .blurred-major {
    filter: blur(6px);
    color: transparent;
    user-select: none;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 4px;
  }

  .blurred-name {
    display: inline-block;
    width: 90px;
    height: 12px;
  }

  .blurred-major {
    display: inline-block;
    width: 70px;
    height: 10px;
  }
`;

export default Contributors;
