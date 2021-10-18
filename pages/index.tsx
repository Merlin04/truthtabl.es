import Head from "next/head";
import {
    Heading,
    Container,
    Box,
    Flex,
    Stack,
    Text,
    useDisclosure,
    useColorModeValue,
    IconButton,
    Link,
    Collapse,
    useBreakpointValue,
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption
} from "@chakra-ui/react";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import Calculator from "../components/Calculator";
import ScrollShadow from "../components/ScrollShadow";

//#region navbar
// https://chakra-templates.dev/navigation/navbar
function Navbar() {
    const { isOpen, onToggle } = useDisclosure();

    return (
        <Box pt={{ base: 0, md: "1rem" }} px={{ base: 0, md: "1rem" }}>
            <Flex
                bg={useColorModeValue('white', 'gray.800')}
                color={useColorModeValue('gray.600', 'white')}
                minH={'60px'}
                py={{ base: 2 }}
                px={{ base: 4 }}
                borderBottom={1}
                borderStyle={'solid'}
                borderColor={useColorModeValue('gray.200', 'gray.900')}
                align={'center'}
                borderRadius={{ base: 0, md: "1rem" }}>
                <Flex
                    ml={{ base: -2 }}
                    display={{ base: 'flex', md: 'none' }}>
                    <IconButton
                        onClick={onToggle}
                        icon={
                            isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
                        }
                        variant={'ghost'}
                        aria-label={'Toggle Navigation'}
                    />
                </Flex>
                <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }} alignItems="center">
                    <Text
                        textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
                        fontFamily={'heading'}
                        color={useColorModeValue('gray.800', 'white')} fontWeight="600" fontSize="1.5rem">
                        TruthTables
                    </Text>

                    <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
                        <DesktopNav />
                    </Flex>
                </Flex>
            </Flex>

            <Collapse in={isOpen} animateOpacity>
                <MobileNav onClick={onToggle} />
            </Collapse>
        </Box>
    );
}

function DesktopNav() {
    const linkColor = useColorModeValue('gray.600', 'gray.200');
    const linkHoverColor = useColorModeValue('gray.800', 'white');

    return (
        <Stack direction={'row'} spacing={4}>
            {NAV_ITEMS.map((navItem) => (
                <Box key={navItem.label}>
                    <Link
                        p={2}
                        href={navItem.href ?? '#'}
                        fontSize={'sm'}
                        fontWeight={500}
                        color={linkColor}
                        _hover={{
                            textDecoration: 'none',
                            color: linkHoverColor,
                        }}>
                        {navItem.label}
                    </Link>
                </Box>
            ))}
        </Stack>
    );
}

function MobileNav(props: { onClick(): void }) {
    return (
        <Stack
            bg={useColorModeValue('white', 'gray.800')}
            p={4}
            display={{ md: 'none' }}>
            {NAV_ITEMS.map((navItem) => (
                <MobileNavItem key={navItem.label} i={navItem} onClick={props.onClick} />
            ))}
        </Stack>
    );
}

function MobileNavItem({ i, onClick }: { i: NavItem, onClick(): void }) {
    return (
        <Stack spacing={4}>
            <Flex
                py={2}
                as={Link}
                href={i.href ?? '#'}
                justify={'space-between'}
                align={'center'}
                _hover={{
                    textDecoration: 'none',
                }}
                onClick={onClick}
            >
                <Text
                    fontWeight={600}
                    color={useColorModeValue('gray.600', 'gray.200')}>
                    {i.label}
                </Text>
            </Flex>
        </Stack>
    );
}

interface NavItem {
    label: string;
    href?: string;
}

const NAV_ITEMS: Array<NavItem> = [
    {
        label: 'Calculator',
        href: "#calculator"
    },
    {
        label: 'Logical operators',
        href: '#'
    },
    {
        label: 'About truth tables',
        href: ""
    },
    {
        label: 'FAQs',
        href: '#'
    },
];
//#endregion

export default function App() {
    return (
        <>
            <Head>
                {/* TODO */}
                <title>TruthTables - Truth table generator</title>
                <meta name="description" content="The best truth table calculator on the web. Solve truth tables with steps, analyze arguments and statements, check logical equivalence, and more!" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Box pos="sticky" top="0" maxW="container.lg" mx="auto" zIndex="9999" mb="2rem">
                <Navbar />
            </Box>
            <Container p="1rem" maxW="container.lg" d="flex" flexDirection="column" alignItems="center" mb="2rem">
                <Heading as="h1">The best truth table generator on the web</Heading>
                {/*<Heading as="h2" size="md" textAlign="center" mt="0.5rem">Solve truth tables with steps, analyze arguments and statements, check logical equivalence, and more!</Heading>*/}
            </Container>
            {/* TODO: responsive */}
            <Flex w="100%" bgColor="secondary.400" direction="column" alignItems="center" mb="4rem">
                <Box maxW="container.lg" w="inherit" position="relative" top="3rem" id="calculator">
                    <Calculator />
                </Box>
            </Flex>
            <Container p="1rem" maxW="container.lg">
                <Stack>
                    <Heading as="h2">Logical operator quick reference</Heading>
                    <Text>The first step in making a truth table is to translate your argument into the language of symbolic logic. Here's a logic translation cheat sheet to help out.</Text>
                    <ScrollShadow>
                        <Table>
                            <Thead fontWeight="500">
                                <Tr>
                                    <Td>Symbol</Td>
                                    <Td>Alternative</Td>
                                    <Td>Name</Td>
                                    <Td>Kind</Td>
                                    <Td>English connectives</Td>
                                </Tr>
                            </Thead>
                            <Tbody sx={{
                                "& td:last-child": {
                                    fontSize: "0.8rem"
                                }
                            }}>
                                <Tr>
                                    <Td>~</Td>
                                    <Td></Td>
                                    <Td>Tilde</Td>
                                    <Td>Negation (NOT)</Td>
                                    <Td>it is not the case that A; not A; it is false that A</Td>
                                </Tr>
                                <Tr>
                                    <Td>&amp;</Td>
                                    <Td></Td>
                                    <Td>Ampersand</Td>
                                    <Td>Conjunction (AND)</Td>
                                    <Td>A and B; A but B; A yet B; A while B; A moreover B; A however B; A nonetheless B; A still B; A nevertheless B; A also B; A although B; both A and B; A additionally B; A furthermore B</Td>
                                </Tr>
                                <Tr>
                                    <Td>v</Td>
                                    <Td></Td>
                                    <Td>Wedge</Td>
                                    <Td>Disjunction (OR)</Td>
                                    <Td>A or B; A unless B</Td>
                                </Tr>
                                <Tr>
                                    <Td>⊃</Td>
                                    <Td>&gt;</Td>
                                    <Td>Horseshoe</Td>
                                    <Td>Conditional (IF)</Td>
                                    <Td>if A, then B; B only if A; A is a necessary condition for B; B is a necessary condition for A; B given that A; B provided that A; A implies that B; B on condition that A; B in case that A</Td>
                                </Tr>
                                <Tr>
                                    <Td>≡</Td>
                                    <Td>=</Td>
                                    <Td>Triple bar</Td>
                                    <Td>Biconditional (IFF)</Td>
                                    <Td>A if and only if B; A just in case that B; A is a necessary and sufficient condition for B; A is equivalent to B</Td>
                                </Tr>
                            </Tbody>
                            <TableCaption>Adapted from <i>Symbolic Logic</i> by Mark Storey (licensed under <Link color="blue.500" href="http://creativecommons.org/licenses/by-nc/4.0/">CC-BY-NC 4.0</Link>)</TableCaption>
                        </Table>
                    </ScrollShadow>
                    <Heading as="h2">What is a truth table?</Heading>
                    <Heading as="h2">How do I use a truth table?</Heading>
                    <Heading as="h2">FAQs</Heading>
                </Stack>
            </Container>
        </>
    )
}