import { Heading, Tabs, TabPanels, TabList, TabPanel, Tab, Box, BoxProps } from "@chakra-ui/react";
import Single from "./Single";
import Compare from './Compare';
import Argument from "./Argument";

export default function Calculator(props: BoxProps) {
    return (
        <Box bg="primary.600" color="white" sx={{
            "& .chakra-button": {
                color: "black"
            }
        }} {...props}>
            <Heading as="h2" id="calculator">Calculator</Heading>
            <Tabs variant="soft-rounded" mt="1rem">
                <TabList sx={{
                    "--chakra-colors-gray-600": "#6883baff"
                }}>
                    <Tab>Truth table</Tab>
                    <Tab>Compare 2 statements</Tab>
                    <Tab>Evaluate argument</Tab>
                </TabList>
                <TabPanels pt="1rem">
                    <TabPanel p="0">
                        <Single />
                    </TabPanel>
                    <TabPanel p="0">
                        <Compare />
                    </TabPanel>
                    <TabPanel p="0">
                        <Argument />
                    </TabPanel>
                </TabPanels>
            </Tabs>
       </Box>
    )
}