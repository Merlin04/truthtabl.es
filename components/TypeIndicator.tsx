import React from "react";
import { Flex, Box, Text } from "@chakra-ui/react";
import { TruthTable } from "./parser/parser";

export const Indicator = (props: { active: boolean, label: string }) => (
    <Flex alignItems="center">
        <Box w="1rem" h="1rem" borderRadius="50%" bgColor={props.active ? "green.500" : "gray.500"} mr="0.5rem" />
        <Text color={props.active ? undefined : "gray.500"}>{props.label}</Text>
    </Flex>
);

export default function TypeIndicator({ data }: { data: TruthTable }) {
    const mainCol = data.cols[data.main].slice(1) as boolean[];

    const tautology = mainCol.every(val => val);
    const contradiction = !tautology && mainCol.every(val => !val);
    const contingency = !tautology && !contradiction;
    
    return (
        <Flex display="vertical">
            <Indicator active={tautology} label="Tautology (all true)" />
            <Indicator active={contradiction} label="Contradiction (all false)" />
            <Indicator active={contingency} label="Contingency (depends on inputs)" />
        </Flex>
    );
}