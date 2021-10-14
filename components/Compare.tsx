import { Box, Text, Stack, Flex, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel } from "@chakra-ui/react";
import ohm from "ohm-js";
import React, { useCallback } from "react";
import Input from "./Input";
import parse, { buildMultipleTruthTable, transpose } from "./parser/parser";
import TypeIndicator, { Indicator } from "./TypeIndicator";
import TruthTable from "./TruthTable";

type ReactStatePair<T> = [T, React.Dispatch<T>];

export function Side({ input, result }: {
    input: ReactStatePair<string>,
    result: ReactStatePair<ReturnType<typeof parse> | undefined>
}) {
    return (
        <>
            <Input result={result[0]} onChange={result[1]} input={input[0]} onInputChange={input[1]} />
            {result[0]?.success && <Box sx={{
                "& > *": {
                    mt: "1rem"
                }
            }}>
                <Accordion allowToggle>
                    <AccordionItem border="1px" borderRadius="0.5rem">
                        <AccordionButton py="0.4rem">
                            <Box flex="1" textAlign="left" fontSize="0.8rem">
                                Show statement details
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb="0.5rem">
                            <TypeIndicator data={result[0].truthTable} />
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
            </Box>}
        </>
    );
}

export default function Compare() {
    // TODO: reduce duplication here?
    const inputs = [React.useState(""), React.useState("")];
    const results = [React.useState<ReturnType<typeof parse>>(), React.useState<ReturnType<typeof parse>>()]

    return (
        <>
            <Text pb="1rem">Compare two statements to determine if they are equivalent (always have the same outcome), contradictory (never have the same outcome), or neither.</Text>
            <Stack direction={{ sm: "column", md: "row" }} mb="1rem">
                <Box flex={1}>
                    <Side input={inputs[0]} result={results[0]} />
                </Box>
                <Box flex={1}>
                    <Side input={inputs[1]} result={results[1]} />
                </Box>
            </Stack>
            {results[0][0]?.success && results[1][0]?.success && (
                <CompareResults data={[results[0][0].match, results[1][0].match]} />
            )}
        </>
    )
}

function CompareResults({ data }: { data: [ohm.MatchResult, ohm.MatchResult] }) {
    const table = buildMultipleTruthTable(data, false);
    const pairs = transpose(table.main.map(colIndex => table.cols[colIndex].slice(1) as boolean[]));

    const equivalent = pairs.every(([a, b]) => a === b);
    const contradictory = !equivalent && pairs.every(([a, b]) => a !== b);

    const consistent = pairs.some(([a, b]) => a && b);

    return (
        <>
            <Flex d="vertical">
                <Indicator active={equivalent} label="Equivalent" />
                <Indicator active={contradictory} label="Contradictory" />
                <Indicator active={!equivalent && !contradictory} label="Neither" />
            </Flex>
            <Flex d="vertical" mt="1rem">
                <Indicator active={consistent} label="Consistent" />
                <Indicator active={!consistent} label="Inconsistent" />
                <Text color="gray.500">* If the statements are logically contrary then they are inconsistent, regardless of what this says</Text>
            </Flex>
            <TruthTable data={table} />
        </>
    );
}