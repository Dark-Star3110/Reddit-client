import { Box, Button, Flex, Spinner, useToast } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React from "react";
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import { useCheckAuth } from "../utils/useCheckAuth";
import NextLink from "next/link";
import { CreatePostInput, useCreatePostMutation } from "../generated/graphql";
import router from "next/router";

const CreatePost = () => {
  const { data: dataAuth, loading: loadingAuth } = useCheckAuth();
  const initialValues = {
    title: "",
    text: "",
  };
  const toast = useToast();

  const [createPost] = useCreatePostMutation();

  const onCreatePostSubmit = async (values: CreatePostInput) => {
    const res = await createPost({
      variables: { createPostInput: values },
      update(cache, { data }) {
        cache.modify({
          fields: {
            posts(existing) {
              // console.log("Existing post", existing);
              if (data?.createPost.success && data.createPost.post) {
                const newPostRef = cache.identify(data.createPost.post);
                // console.log("new Ref", newPostRef);

                const newPostsAfterCreate = {
                  ...existing,
                  totalCount: existing.totalCount + 1,
                  paginatedPosts: [
                    { __ref: newPostRef },
                    ...existing.paginatedPosts,
                  ],
                };
                // console.log("new PostsAfterCreate", newPostsAfterCreate);
                return newPostsAfterCreate;
              }
            },
          },
        });
      },
    });

    if (res.data?.createPost.success) {
      router.push("/");
      toast({
        title: "Create successfully",
        description: `Create post successfully`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loadingAuth || (!loadingAuth && !dataAuth?.me)) {
    return (
      <Flex justifyContent="center" alignItems="center" minHeight="100vh">
        <Spinner />
      </Flex>
    );
  } else {
    return (
      <Layout>
        <Formik initialValues={initialValues} onSubmit={onCreatePostSubmit}>
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

              <Flex justifyContent="space-between" alignItems="center" mt={4}>
                <Button
                  type="submit"
                  colorScheme="teal"
                  isLoading={isSubmitting}
                >
                  Create Post
                </Button>
                <NextLink href="/">
                  <Button>Back to Home page</Button>
                </NextLink>
              </Flex>
            </Form>
          )}
        </Formik>
      </Layout>
    );
  }
};

export default CreatePost;
