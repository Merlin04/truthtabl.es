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
    Tr,
    Td,
    TableCaption,
    Image,
    BoxProps,
    OrderedList,
    ListItem
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

            <Collapse in={isOpen} animateOpacity style={{
                // For some reason TypeScript doesn't know about these properties
                position: "absolute",
                width: "100%"
            }}>
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
        href: '#operators'
    },
    {
        label: 'About truth tables',
        href: "#truthtables"
    },
    {
        label: 'FAQs',
        href: '#faqs'
    },
];
//#endregion

function Quote(props: BoxProps) {
    return (
        <Box borderLeft="0.25rem" borderColor="gray.500" color="gray.700" borderStyle="solid" pl="1rem" fontStyle="italic" my="0.5rem" fontSize="1rem" {...props} />
    )
}

const float_img_sx = {
    maxWidth: { base: "300px", md: "min(40%, 400px)" },
    marginLeft: { base: "0", md: "1rem" },
    float: { base: "none", md: "right" },
    padding: "0.5rem"
};

export default function App() {
    return (
        <>
            <Head>
                {/* TODO */}
                <title>Truth Table Generator with Conclusion - TruthTables</title>
                <meta name="description" content="Most powerful online logic truth table calculator. Easily construct truth tables with steps, generate conclusions, check tautologies, analyze arguments, and more!" />
                <link rel="icon" href="/favicon.ico" />
                
            </Head>
            <Box pos="sticky" top="0" maxW="container.lg" mx="auto" zIndex="1300" mb="2rem">
                <Navbar />
            </Box>
            <Container p="1rem" maxW="container.lg" display="flex" flexDirection="column" alignItems="center" mb="2rem">
                <Heading as="h1">The best truth table generator on the web</Heading>
                {/*<Heading as="h2" size="md" textAlign="center" mt="0.5rem">Solve truth tables with steps, analyze arguments and statements, check logical equivalence, and more!</Heading>*/}
            </Container>
            <Flex w="100%" bgColor={{ base: "primary.600", calculator: "secondary.400" }} direction="column" alignItems="center" mb={{ base: "1rem", calculator: "4rem" }}>
                <Box maxW="container.lg" w="inherit" position="relative" top={{ base: 0, calculator: "3rem" }}>
                    <Calculator p="2rem" borderRadius={{base: 0, calculator: "1.5rem"}} />
                </Box>
            </Flex>
            <Container p="1rem" maxW="container.lg" sx={{
                "& h3": {
                    mt: "1rem",
                    mb: "0.5rem"
                },
                "& h2": {
                    mt: "1rem",
                    mb: "0.75rem"
                }
            }}>
                <Heading as="h2" id="operators">Logical operator quick reference</Heading>
                <Text>The first step in making a truth table is to translate your argument into the language of symbolic logic. Here's a logic translation cheat sheet to help out.</Text>
                <ScrollShadow maxW="100%">
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
                                <Td>!</Td>
                                <Td>Tilde</Td>
                                <Td>Negation (NOT)</Td>
                                <Td>it is not the case that A; not A; it is false that A</Td>
                            </Tr>
                            <Tr>
                                <Td>&amp;</Td>
                                <Td>&amp;&amp;, /\</Td>
                                <Td>Ampersand</Td>
                                <Td>Conjunction (AND)</Td>
                                <Td>A and B; A but B; A yet B; A while B; A moreover B; A however B; A nonetheless B; A still B; A nevertheless B; A also B; A although B; both A and B; A additionally B; A furthermore B</Td>
                            </Tr>
                            <Tr>
                                <Td>v</Td>
                                <Td>||, \/</Td>
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
                                <Td>==, =</Td>
                                <Td>Triple bar</Td>
                                <Td>Biconditional (IFF)</Td>
                                <Td>A if and only if B; A just in case that B; A is a necessary and sufficient condition for B; A is equivalent to B</Td>
                            </Tr>
                        </Tbody>
                        <TableCaption>Adapted from <i>Symbolic Logic</i> by Mark Storey (licensed under <Link color="blue.500" href="http://creativecommons.org/licenses/by-nc/4.0/">CC-BY-NC 4.0</Link>)</TableCaption>
                    </Table>
                </ScrollShadow>
                <Box display="flow-root">
                    <Heading as="h2" id="truthtables">What is a truth table?</Heading>
                    <Image src="/images/undraw_Spreadsheets_re_alt0.svg" alt="Illustration of person looking at a spreadsheet" sx={float_img_sx} />
                    <Text>A truth table is a table that you can use to work with logic statements. <Link color="blue.500" href="https://en.wikipedia.org/wiki/Truth_table">Wikipedia says that:</Link></Text>
                    <Quote>
                        A truth table is a mathematical table used in logic—specifically in connection with Boolean algebra, boolean functions, and propositional calculus—which sets out the functional values of logical expressions on each of their functional arguments, that is, for each combination of values taken by their logical variables. In particular, truth tables can be used to show whether a propositional expression is true for all legitimate input values, that is, logically valid.
                    </Quote>
                    <Text>But that's not very helpful if you're not already a logician. Basically, a truth table shows all of the possible inputs and outputs of a logic statement.</Text>
                    <Heading as="h3" size="md" mt="1rem" mb="0.5rem">What's a symbolic logic statement?</Heading>
                    <Text>A symbolic logic statement is a way to represent a logical argument with symbols. So, you could write something like this:</Text>
                    <Quote>
                        I'm a human, or I'm a robot and I have a CPU for a brain.
                    </Quote>
                    <Text>into something like this:</Text>
                    <Quote>
                        H v (R &amp; C)
                    </Quote>
                    <Text>To translate this into symbolic logic, we turned each of the <i>atomic statements</i> of the statement into single letter constants, and words like <i>or</i> and <i>and</i> into the corresponding <i>logical operators</i> (<i>v</i> and <i>&amp;</i>). You can find a list of all logical operators <Link color="blue.500" href="#operators">here</Link>.</Text>
                    <Text>
                        Now that we have a symbolic logic statement, we can generate a truth table for it. To do that, type it into <Link color="blue.500" href="#calculator">the calculator</Link>. You should see an output like this:
                        <Image src="/images/example.png" alt="Screenshot of output of calculator (a truth table and indicators)" h="25rem" my="1rem" />
                        At the very top, there's a thumbs up emoji indicating the statement is well-formed. If you added an error into the statement (like changing "&amp;" to "&amp;&amp;") that would go away and you'd see an error message. There's also a "Prettify" button to replace operators like <i>&gt;</i> or <i>=</i> with nicer-looking versions. Next, you'll see indicators showing that the statement is a <i>contingency</i>. This simply means that the statement could either be true or false, depending on whether the inputs (the identifiers) are true or false. Statements can also be tautologies (the statement is always true, no matter what the inputs are) or contradictions (always false). For example, <i>A v ~A</i> is a tautology because if you translate it to English, it's saying that "A is true or it's false", which of course is always true regardless of what A is. <i>A &amp; ~A</i> is a contradiction because it's saying that "A is true and it's false", and it's impossible for something to be both true and false at the same time. Our example is a contingency because it's possible for me to be neither a human or a robot, or I could be a robot but not have a CPU for a brain.
                    </Text>
                    <Text>
                        Finally, we have a truth table for our statement. Each component of our statement is broken out into a column of the table. The <i>main operator</i>'s column is highlighted; this is the "output" of the statement. Let's try using it! First, we have to determine what the value of each identifier is. I'm a human, I'm not a robot, and I don't have a CPU for a brain, so H is true, R is false, and C is also false. On the table, we can find the row where each of our identifiers has the value we determined:
                        <Image src="/images/example2.png" alt="The truth table from above with the &lquo;T T F F F&rquo; row highlighted." my="1rem" />
                        And we can see that in this row, the main operator is true, meaning that the statement is true!
                    </Text>
                </Box>
                <Box display="flow-root">
                    <Heading as="h2">How to use a truth table?</Heading>
                    <Image src="/images/undraw_Detailed_analysis_re_tk6j.svg" alt="Illustration of person thinking logically" sx={float_img_sx} />
                    <Text>To summarize, to make and use a truth table:</Text>
                    <OrderedList>
                        <ListItem>Translate your statement into symbolic logic</ListItem>
                        <ListItem>Paste your statement into the <Link color="blue.500" href="#calculator">calculator</Link> to generate the truth table</ListItem>
                        <ListItem>Find the row on the table where the values of the identifiers match your input values</ListItem>
                        <ListItem>Read the value in the main operator column (highlighted) to see the result!</ListItem>
                    </OrderedList>
                </Box>
                <Box display="flow-root">
                    <Heading as="h2" id="faqs">FAQs</Heading>
                    <Image src="/images/undraw_Faq_re_31cw.svg" alt="Illustration of frequently asked questions" sx={float_img_sx} />
                    <Heading as="h3" size="md">Are truth tables hard?</Heading>
                    <Text>Truth tables can seem a bit intimidating at first, but once you get the hang of how to use them they're very straightforward. Using them is just a matter of plugging in values and finding the corresponding row.</Text>
                    <Heading as="h3" size="md">Why are truth tables useful?</Heading>
                    <Text>Truth tables allow you to easily analyze a logical statement. It allows you to see the output of the statement for all combinations of inputs, which is helpful if the statement is very complicated and difficult to manually evaluate.</Text>
                    <Heading as="h3" size="md">What are some other terms for symbolic logic?</Heading>
                    <Text>Symbolic logic can also be referred to as "formal logic," or more broadly, "mathematical logic." You can view more synonyms on <Link color="blue.500" href="https://www.powerthesaurus.org/symbolic_logic/synonyms">Power Thesaurus</Link> (an excellent thesaurus site).</Text>
                </Box>
            </Container>
        </>
    )
}