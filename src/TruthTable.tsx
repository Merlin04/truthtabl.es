import React from "react";
import { Table, Thead, Tr, Td, Th, Tbody } from "@chakra-ui/react";
import { TruthTable as TruthTableResult, transpose } from "./parser/parser";

export default function TruthTable({ data }: { data: TruthTableResult<any> }) {
    const table = transpose(data.cols);
    const isMain = Array.isArray(data.main) ? (index: number) => (data.main as number[]).includes(index) : (index: number) => data.main === index;

    return (
        <Table variant="simple" size="sm" w="initial" mt="1rem">
            <Thead>
                <Tr>
                    {table[0].map((val, index) => <Td bgColor={isMain(index) ? "blue.600" : "gray.500"} fontWeight="500">{val}</Td>)}
                </Tr>
            </Thead>
            <Tbody>
                {table.slice(1).map(row => <Tr>{row.map((val, index) => <Td bgColor={val === "" ? "transparent" : isMain(index) ? (val ? "blue.400" : "blue.600") : (val ? "gray.200" : "gray.300")} color={isMain(index) ? "white" : "black"}>{val === "" ? "" : val ? "T" : "F"}</Td>)}</Tr>)}
            </Tbody>
        </Table>
    );
}