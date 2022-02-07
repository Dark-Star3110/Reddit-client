import { gql, Reference } from "@apollo/client";
import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import {
  MeDocument,
  MeQuery,
  useLogoutMutation,
  useMeQuery,
} from "../generated/graphql";

const Navbar = () => {
  const { data, loading: useMeQueryLoading, error } = useMeQuery();

  const [logout, { loading: useLogoutLoading }] = useLogoutMutation();

  const logoutUser = async () => {
    await logout({
      update(cache, { data }) {
        if (data?.logout) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: { me: null },
          });

          cache.modify({
            fields: {
              posts(existing) {
                existing.paginatedPosts.forEach((post: Reference) => {
                  cache.writeFragment({
                    id: post.__ref,
                    fragment: gql`
                      fragment VoteValue on Post {
                        voteValue
                      }
                    `,
                    data: {
                      voteValue: 0,
                    },
                  });
                });
                return existing;
              },
            },
          });
        }
      },
    });
  };

  let body;

  if (useMeQueryLoading) {
    body = null;
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex>
        <NextLink href="/create-post">
          <Button mr={4}>Create Post</Button>
        </NextLink>
        <Button onClick={logoutUser} isLoading={useLogoutLoading}>
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Box bg="tan" p={4}>
      <Flex maxW={800} justifyContent="space-between" m="auto" align="center">
        <NextLink href="/">
          <Heading>Reddit</Heading>
        </NextLink>
        <Box>{body}</Box>
      </Flex>
    </Box>
  );
};

export default Navbar;
