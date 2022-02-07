import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import {
  PostWithUserInfoFragment,
  useVoteMutation,
  VoteType,
} from "../generated/graphql";

interface VotePostSectionProps {
  post: PostWithUserInfoFragment;
}

enum VoteTypeValues {
  Upvote = 1,
  Downvote = -1,
}

const VotePostSection = ({ post }: VotePostSectionProps) => {
  const [voteMutation, { loading }] = useVoteMutation();
  const [loadingVote, setLoadingVote] = useState<
    "up-loading" | "down-loading" | "not-loading"
  >("not-loading");

  const upVote = async (postId: string) => {
    setLoadingVote("up-loading");
    await voteMutation({
      variables: {
        postId: parseInt(postId),
        inputVoteValue: VoteType.Upvote,
      },
    });
    setLoadingVote("not-loading");
  };

  const downVote = async (postId: string) => {
    setLoadingVote("down-loading");
    await voteMutation({
      variables: {
        postId: parseInt(postId),
        inputVoteValue: VoteType.Downvote,
      },
    });
    setLoadingVote("not-loading");
  };
  return (
    <Flex direction="column" alignItems="center" mr={4}>
      <IconButton
        icon={<ChevronUpIcon />}
        aria-label="upvote"
        onClick={() => {
          if (post.voteValue === VoteTypeValues.Upvote) return;
          upVote(post.id);
        }}
        isLoading={loading && loadingVote === "up-loading"}
        colorScheme={
          post.voteValue === VoteTypeValues.Upvote ? "green" : undefined
        }
      />
      {post.points}
      <IconButton
        icon={<ChevronDownIcon />}
        aria-label="downvote"
        onClick={() => {
          if (post.voteValue === VoteTypeValues.Downvote) return;
          downVote(post.id);
        }}
        isLoading={loading && loadingVote === "down-loading"}
        colorScheme={
          post.voteValue === VoteTypeValues.Downvote ? "red" : undefined
        }
      />
    </Flex>
  );
};

export default VotePostSection;
