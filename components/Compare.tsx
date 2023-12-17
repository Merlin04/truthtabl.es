import { Box, Text, Stack, Flex, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel } from "@chakra-ui/react";
import ohm, { MatchResult } from "ohm-js";
import React, { useCallback } from "react";
import Input from "./Input";
import { parse, buildMultipleTruthTable, transpose, ParseResult } from "./parser/parser";
import TypeIndicator, { Indicator } from "./TypeIndicator";
import TruthTable from "./TruthTable";

type ReactStatePair<T> = [T, React.Dispatch<T>];

export function Side({ input, result }: {
    input: ReactStatePair<string>,
    result: ReactStatePair<ParseResult | undefined>
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
                            <TypeIndicator data={result[0].table.detailed} />
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
            </Box>}
        </>
    );
}

export default function Compare() {
    const left_input = React.useState("");
    const right_input = React.useState("");
    const left_result = React.useState<ParseResult>();
    const right_result = React.useState<ParseResult>();

    return (
        <>
            <Text pb="1rem">Compare two statements to determine if they are equivalent (always have the same outcome), contradictory (never have the same outcome), or neither.</Text>
            <Stack direction={{ sm: "column", md: "row" }} mb="1rem">
                <Box flex={1}>
                    <Side input={left_input} result={left_result} />
                </Box>
                <Box flex={1}>
                    <Side input={right_input} result={right_result} />
                </Box>
            </Stack>
            {left_result[0]?.success && right_result[0]?.success && (
                <CompareResults data={[left_result[0], right_result[0]]} />
            )}
        </>
    )
}

function CompareResults({ data }: { data: [ParseResult, ParseResult] }) {
    const table = buildMultipleTruthTable(data.map(d => d.match as MatchResult), false);
    const pairs = transpose(table.detailed.main.map(colIndex => table.detailed.cols[colIndex].slice(1) as boolean[]));

    const equivalent = pairs.every(([a, b]) => a === b);
    const contradictory = !equivalent && pairs.every(([a, b]) => a !== b);

    const consistent = pairs.some(([a, b]) => a && b);

    return (
        <>
            <Flex display="vertical">
                <Indicator active={equivalent} label="Equivalent" />
                <Indicator active={contradictory} label="Contradictory" />
                <Indicator active={!equivalent && !contradictory} label="Neither" />
            </Flex>
            <Flex display="vertical" my="1rem">
                <Indicator active={consistent} label="Consistent" />
                <Indicator active={!consistent} label="Inconsistent" />
                <Text color="gray.500">* If the statements are logically contrary then they are inconsistent, regardless of what this says</Text>
            </Flex>
            <TruthTable data={table} />
        </>
    );
}