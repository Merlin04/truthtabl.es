import React from "react";
import {
    Table,
    Thead,
    Tr,
    Td,
    Tbody,
    Box,
    FormControl,
    FormLabel,
    Switch,
    Popover,
    PopoverTrigger, PopoverContent, PopoverBody, PopoverArrow, PopoverHeader, useMediaQuery
} from "@chakra-ui/react";
import { TruthTableData, transpose } from "./parser/parser";
import ScrollShadow from "./ScrollShadow";
import { QuestionOutlineIcon } from "@chakra-ui/icons";

export default function TruthTable({ data }: { data: TruthTableData<any> }) {
    const [detailed, setDetailed] = React.useState(false); // TODO: localstorage
    const table = detailed ? data.detailed : data.simple;
    const rows = transpose(table.cols);
    const isMain = (index: number) => Array.isArray(table.main)
        ? table.main.includes(index)
        : table.main === index;
    const [canHover] = useMediaQuery("(hover: hover)");

    return (
        <Box>
            <FormControl display="flex" gap="0.5rem" alignItems="center">
                <Switch isChecked={detailed} onChange={(e) => setDetailed(e.target.checked)} />
                <FormLabel mb={0} mr={0}>
                    Show full table
                </FormLabel>
                <Popover trigger={canHover ? "hover" : "click"}>
                    <PopoverTrigger>
                        <QuestionOutlineIcon cursor="pointer" opacity="0.9" />
                    </PopoverTrigger>
                    <PopoverContent color="black">
                        <PopoverArrow />
                        <PopoverBody>
                            Show a detailed version of the truth table, including the intermediate steps.
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
            </FormControl>
            <ScrollShadow mt="1rem" w="100%">
                <Table variant="simple" size="sm" w="initial">
                    <Thead>
                        <Tr>
                            {rows[0].map((val, index) => <Td bgColor={isMain(index) ? "blue.600" : "gray.500"} fontWeight="500"><code>{val}</code></Td>)}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {rows.slice(1).map(row => <Tr>
                            {row.map((val, index) => <Td
                                textAlign="center"
                                bgColor={val === "" ? "transparent" : isMain(index) ? (val ? "blue.400" : "blue.600") : (val ? "gray.200" : "gray.300")}
                                color={isMain(index) ? "white" : "black"}
                            >{val === "" ? "" : val ? "T" : "F"}</Td>)}
                        </Tr>)}
                    </Tbody>
                </Table>
            </ScrollShadow>
        </Box>
    );
}