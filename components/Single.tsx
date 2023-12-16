import * as React from 'react'
import parse from "./parser/parser";
import { Text, Link, Box } from "@chakra-ui/react";
import TruthTable from "./TruthTable";
import "ts-replace-all";
import TypeIndicator from './TypeIndicator';
import Input from "./Input";

const example = "~{[(A & G) v ~(U > ~S)] v I}";

export default function Single() {
    const [input, setInput] = React.useState("");
    const [result, setResult] = React.useState<ReturnType<typeof parse>>();

    return (
        <>
            <Text mb="1rem">Generate a truth table for a symbolic logic statement.</Text>
            <Input result={result} onChange={setResult} input={input} onInputChange={setInput} />
            {result?.success && <Box sx={{
                "& > *": {
                    mt: "1rem"
                }
            }}>
                <TypeIndicator data={result.truthTable} />
                <TruthTable data={result.truthTable} />
            </Box>}
            <Text color="primary.400" pt="1rem">
                Confused? Try <Link display="inline-block" color="blue.500" onClick={() => setInput(example)}><code>{example}</code></Link>, or learn more below
            </Text>
        </>
    )
}