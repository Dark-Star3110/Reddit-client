import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import Layout from "../../../components/Layout";
import {
  UpdatePostInput,
  useMeQuery,
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import NextLink from "next/link";
import { Form, Formik } from "formik";
import InputField from "../../../components/InputField";

const PostEdit = () => {
  const toast = useToast();
  const router = useRouter();
  const postId = router.query.id as string;
  const { data: meData, loading: meLoading } = useMeQuery();
  const { data: postData, loading: postLoading } = usePostQuery({
    variables: {
      id: postId,
    },
  });
  const [updatePostMutation, _] = useUpdatePostMutation();

  if (meLoading || postLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" minHeight="100vh">
        <Spinner />
      </Flex>
    );
  }

  if (!postData?.post)
    return (
      <Layout>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Post Not Found</AlertTitle>
        </Alert>
        <Box mt={4}>
          <NextLink href="/">
            <Button>Back to Home</Button>
          </NextLink>
        </Box>
      </Layout>
    );

  if (
    !meLoading &&
    !postLoading &&
    meData?.me?.id !== postData?.post?.userId.toString()
  ) {
    return (
      <Layout>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Unauthorize</AlertTitle>
        </Alert>
        <Box mt={4}>
          <NextLink href="/">
            <Button>Back to Home</Button>
          </NextLink>
        </Box>
      </Layout>
    );
  }

  const initialValues = {
    title: postData.post.title,
    text: postData.post.text,
  };

  const onUpdatePostSubmit = async (values: Omit<UpdatePostInput, "id">) => {
    const response = await updatePostMutation({
      variables: {
        updatePostInput: {
          id: postId,
          ...values,
        },
      },
    });

    if (response.data?.updatePost.success) {
      toast({
        title: "Update post successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      router.back();
    }
  };

  return (
    <Layout>
      <Formik initialValues={initialValues} onSubmit={onUpdatePostSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="title"
              placeholder="Title"
              label="Title"
              type="text"
            />
            <Box mt={4}>
              <InputField
                name="text"
                placeholder="Text"
                label="Text"
                type="text"
                textarea
              />
            </Box>
            <Flex justifyContent="space-between" alignItems="center">
              <Button
                type="submit"
                colorScheme="teal"
                mt={4}
                isLoading={isSubmitting}
              >
                Update Post
              </Button>

              <NextLink href="/">
                <Button mt={4}>Back to Home</Button>
              </NextLink>
            </Flex>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default PostEdit;
