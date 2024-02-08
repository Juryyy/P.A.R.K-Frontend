<!-- This file is deprecated, no purpose when .csv is working as intended-->

<template>
  <q-file
  v-model="file"
  label="Upload Excel"
  @input="uploadExcel"
/>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import * as ExcelJS from 'exceljs';
import type { Candidate } from './models';
import * as h from 'src/functions/FileReadHelper';


const file = ref<File | null>(null)
const excelData = ref<Candidate[]>([]);

const uploadExcel = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async () => {
      const buffer = new Uint8Array(reader.result as ArrayBuffer);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.getWorksheet(1);
      const jsonData:unknown[] = [];
      if(!worksheet) return;
      worksheet.eachRow((row, rowNumber) => {
        const rowJson: { [key: string]: unknown; } = {};
        row.eachCell((cell, colNumber) => {
          rowJson[worksheet.getRow(1).getCell(colNumber).value as string] = cell.value;
        });
        jsonData.push(rowJson);
      });
      console.log(jsonData);
    };
    reader.readAsArrayBuffer(file);
  }
};
</script>
