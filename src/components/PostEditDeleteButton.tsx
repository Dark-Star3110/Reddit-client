import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, IconButton, useToast } from "@chakra-ui/react";
import React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";
import NextLink from "next/link";
import { useRouter } from "next/router";

interface IPostEditDeleteButtonProps {
  postId: string;
  postUserId: string;
}

const PostEditDeleteButton = ({
  postId,
  postUserId,
}: IPostEditDeleteButtonProps) => {
  const router = useRouter();
  const toast = useToast();
  const { data: meData } = useMeQuery();
  // const [updatePostMutation] = useUpdatePostMutation();
  const [deletePostMutation] = useDeletePostMutation();

  const handleDelete = async () => {
    const res = await deletePostMutation({
      variables: {
        id: postId,
      },
      update(cache, { data }) {
        if (data?.deletePost.success) {
          cache.evict({ id: `Post:${postId}` });
        }
      },
    });

    if (res.data?.deletePost.success) {
      toast({
        title: "Delete successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      router.push("/");
    } else {
      toast({
        title: "Delete fail",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (meData?.me?.id !== postUserId) {
    return null;
  }

  return (
    <Box>
      <NextLink href={`/post/edit/${postId}`}>
        <IconButton icon={<EditIcon />} aria-label="Edit" mr={4}></IconButton>
      </NextLink>
      <IconButton
        icon={<DeleteIcon />}
        aria-label="Delete"
        colorScheme="red"
        onClick={handleDelete}
      ></IconButton>
    </Box>
  );
};

export default PostEditDeleteButton;
