import styled from "styled-components";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetLatestUsersQuery } from "@/redux/queries/userApi";

const Contributors = () => {
  const { data: latestUsers } = useGetLatestUsersQuery();
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center flex-col py-20 bg-neutral-900">
      <div className="marquee_header mb-5 text-center px-4">
        <p className="text-white font-bold text-3xl mb-2">Our Students</p>
        <p className="text-white/80 text-lg">
          Big thanks to all AUK students supporting our platform — welcome aboard!
        </p>
      </div>

      <StyledWrapper>
        <div className="marquee w-[400px] sm:w-[500px] md:w-[700px] lg:w-[1000px]">
          <div className="marquee__inner">
            <div className="marquee__group">
              {latestUsers?.map((user, i) => {
                const username = user.username || "";
                const initials =
                  username.length > 1
                    ? username[0].toUpperCase() + username[username.length - 1].toUpperCase()
                    : username[0]?.toUpperCase() || "";
                return (
                  <BlurredCard key={i}>
                    <div className="flex items-center gap-3">
                      <div className="avatar">{initials}</div>
                      <span>{user.name}</span>
                    </div>
                  </BlurredCard>
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
                return (
                  <BlurredCard key={i + latestUsers.length}>
                    <div className="flex items-center gap-3">
                      <div className="avatar">{initials}</div>
                      <span>{user.name}</span>
                    </div>
                  </BlurredCard>
                );
              })}
            </div>
          </div>

          <div className="marquee__inner marquee__inner--second">
            <div className="marquee__group">
              {latestUsers?.map((user, i) => {
                const username = user.username || "";
                const initials =
                  username.length > 1
                    ? username[0].toUpperCase() + username[username.length - 1].toUpperCase()
                    : username[0]?.toUpperCase() || "";
                return (
                  <BlurredCard key={i}>
                    <div className="flex items-center gap-3">
                      <div className="avatar">{initials}</div>
                      <span>{user.name}</span>
                    </div>
                  </BlurredCard>
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
                return (
                  <BlurredCard key={i + latestUsers.length}>
                    <div className="flex items-center gap-3">
                      <div className="avatar">{initials}</div>
                      <span>{user.name}</span>
                    </div>
                  </BlurredCard>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            onClick={() => navigate("/register")}
            variant="default"
            className="rounded-full bg-tomato hover:bg-tomato/90 shadow-[0_0_10px_tomato] text-white">
            Join the wolfpack <ArrowRight />
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
    gap: 10px;
    width: max-content;
    animation: marquee 90s linear infinite;
    margin-bottom: 20px;
  }

  .marquee__inner--second {
    animation: marquee 90s linear infinite reverse;
  }

  .marquee__group {
    display: flex;
    gap: 10px;
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

const BlurredCard = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 1rem;
  font-weight: 500;
  min-width: 200px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 9999px;
    background-color: #ff6347; /* tomato */
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-weight: bold;
    font-size: 1rem;
    flex-shrink: 0;
  }
`;

export default Contributors;
