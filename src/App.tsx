import * as React from 'react'
import { Heading, Container, Tabs, TabPanels, TabList, TabPanel, Tab } from "@chakra-ui/react";
import Single from "./Single";
import Compare from './Compare';
import Argument from "./Argument";

export default function App() {
    return (
        <Container p="1rem" maxW="container.lg">
            <Heading>Symbolic logic truth table tool</Heading>
            <Tabs variant="soft-rounded" mt="1rem">
                <TabList>
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
       </Container>
    )
}