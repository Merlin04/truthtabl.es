import Head from "next/head";
import { Heading, Container, Tabs, TabPanels, TabList, TabPanel, Tab, Box, Flex, Stack, Text, useDisclosure, useColorModeValue, IconButton, HStack, Menu, MenuButton, MenuList, MenuItem, MenuDivider, Button, Link, Collapse, useBreakpointValue } from "@chakra-ui/react";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import Calculator from "../components/Calculator";

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
        label: 'About truth tables',
        href: ""
    },
    {
        label: 'Logical operators',
        href: '#'
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
                <meta name="description" content="The best step-by-step truth table calculator on the net. Solve truth tables, analyze arguments and statements, check logical equivalence, and more!" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Box pos="sticky" top="0" maxW="container.lg" mx="auto" zIndex="9999" mb="2rem">
                <Navbar />
            </Box>
            <Container p="1rem" maxW="container.lg" d="flex" flexDirection="column" alignItems="center" mb="2rem">
                <Heading as="h1">The best truth table generator on the web</Heading>
            </Container>
            {/* TODO: responsive */}
            <Flex w="100%" bgColor="secondary.400" direction="column" alignItems="center">
                <Box maxW="container.lg" w="inherit" position="relative" top="3rem" id="calculator">
                    <Calculator />
                </Box>
            </Flex>
            <Container p="1rem" maxW="container.lg">
                Test
            </Container>
        </>
    )
}