import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { PostsDocument, usePostsQuery } from "../generated/graphql";
import { addApolloState, initializeApollo } from "../lib/apolloClient";
import NextLink from "next/link";
import Layout from "../components/Layout";
import PostEditDeleteButton from "../components/PostEditDeleteButton";
import { NetworkStatus } from "@apollo/client";
import VotePostSection from "../components/VotePostSection";
import { GetServerSideProps, GetServerSidePropsContext } from "next";

const limit = 3;

const Index = () => {
  const { data, loading, fetchMore, networkStatus } = usePostsQuery({
    variables: {
      limit,
    },
    notifyOnNetworkStatusChange: true, //components nao co render boi post query nay se dc rerender khi networkStatus thay doi, tuc la fetchMore
  });

  const loadingMorePosts = networkStatus === NetworkStatus.fetchMore;

  const loadMore = () =>
    fetchMore({ variables: { limit, cursor: data?.posts?.cursor } });

  return (
    <Layout>
      {loading && !loadingMorePosts ? (
        <Flex justifyContent="center" alignItems="center" minHeight="100vh">
          <Spinner />
        </Flex>
      ) : (
        <Stack spacing={8}>
          {data?.posts?.paginatedPosts.map((post) => (
            <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
              <VotePostSection post={post} />
              <Box flex={1}>
                <NextLink href={`/post/${post.id}`}>
                  <Link>
                    <Heading fontSize="xl">{post.title}</Heading>
                  </Link>
                </NextLink>
                <Text color="tomato">posted by {post.user.username}</Text>
                <Flex align="center">
                  <Text mt={4}>{post.textSnippet}</Text>
                  <Box ml="auto">
                    <PostEditDeleteButton
                      postId={post.id}
                      postUserId={post.user.id}
                    />
                  </Box>
                </Flex>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}

      {data?.posts?.hasMore && (
        <Flex>
          <Button
            m="auto"
            my={8}
            isLoading={loadingMorePosts}
            onClick={loadMore}
          >
            {loadingMorePosts ? "Loading" : "Show More"}
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const apolloClient = initializeApollo({ headers: context.req.headers });

  await apolloClient.query({
    query: PostsDocument,
    variables: {
      limit,
    },
  });

  return addApolloState(apolloClient, {
    props: {},
  });
};

export default Index;
