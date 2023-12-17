import { Stack, StackDivider, Heading, CloseButton, Flex, Divider, Box, Button, Text, useDisclosure } from "@chakra-ui/react";
import React from "react";
import { buildMultipleTruthTable, transpose, ParseResult } from "./parser/parser";
import { AddIcon } from "@chakra-ui/icons";
import { Side } from "./Compare";
import TruthTable from "./TruthTable";
import { Indicator } from "./TypeIndicator";
import ProofBuilder from "./ProofBuilder";
import { MatchResult } from "ohm-js";

export default function Argument() {
    const [premises, setPremises] = React.useState<[
        string,
        ParseResult | undefined
    ][]>([["", undefined]]);
    const conclusionInput = React.useState("");
    const conclusionResult = React.useState<ParseResult | undefined>(undefined);
    const argumentResultsData = React.useMemo(() => [...(premises.map(p => p[1])), conclusionResult[0]], [premises, conclusionResult]);

    return (
        <>
            <Text pb="1rem">Determine if an argument constructed of premises and a conclusion is valid (which means that if all of the premises are true, the conclusion is true), then construct a proof for the argument.</Text>
            <Stack divider={<StackDivider borderColor="gray.400" />} borderWidth="1px" borderColor="gray.200" borderRadius="1rem" p="1rem" direction="column" mt="1rem">
                {premises.map(([input, result], index) => (
                    <Flex key={index}>
                        <CloseButton size="sm" disabled={premises.length < 2} onClick={() => { premises.splice(index, 1); setPremises([...premises]); }} />
                        <Divider orientation="vertical" mx="0.5rem" borderColor="gray.400" h="auto" />
                        <Stack direction="column" flex={1}>
                            <Heading size="sm">Premise {index + 1}</Heading>
                            <Box>
                                <Side input={[input, (i) => { premises[index][0] = i; setPremises([...premises]); }]} result={[result, (i) => { premises[index][1] = i; setPremises([...premises]); }]} />
                            </Box>
                        </Stack>
                    </Flex>
                ))}
                <Button size="sm" leftIcon={<AddIcon />} w="fit-content" onClick={() => setPremises([...premises, ["", undefined]])}>Add premise</Button>
            </Stack>
            <Heading size="sm" mt="1rem">Conclusion</Heading>
            <Side input={conclusionInput} result={conclusionResult} />
            {premises.every(p => p[1]?.success) && conclusionResult[0]?.success && (
                //@ts-expect-error (it doesn't understand the success check)
                <ArgumentResults data={argumentResultsData} />
            )}
        </>
    );
}

function ArgumentResults({ data }: { data: ParseResult[] }) {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const table = React.useMemo(() => buildMultipleTruthTable(data.map(d => d.match as MatchResult), true), [data]);

    // An argument is invalid if there exists a row where all premises are true yet the conclusion is false
    const valid = transpose(
        table.detailed.cols
            .filter((_, index) => table.detailed.main.includes(index))
            .map(col => col.slice(1))
    ).every(row => !row.every((val, index, array) => index === array.length - 1 ? !val : val));
 
    return (
        <>
            <Flex display="vertical" my="1rem">
                <Indicator active={valid} label="Valid" />
                <Indicator active={!valid} label="Invalid" />
            </Flex>
            <TruthTable data={table} />
            {valid && (
                <>
                    <Button onClick={onOpen}>Open proof builder (beta)</Button>
                    <ProofBuilder isOpen={isOpen} onClose={onClose} data={data.map(d => 
                        d.match
                            //@ts-expect-error -  It doesn't know that the items in data will always be valid
                            .input
                    )} />
                </>          
            )}
        </>
    );
}