<template>
  <div>
    <div class="pdf-container" ref="pdfcontainer">
      <pdf v-for="i in numPages" :key="i" :src="pdfUrl" :page="i"> </pdf>
    </div>
  </div>
</template>

<script>
// import pdf from 'vue3-pdf';
import pdf from 'vue3-pdf/src/vuePdfNoSssNoWorker';
import CMapReaderFactory from 'vue3-pdf/src/CMapReaderFactory.js';

export default {
  data() {
    return {
      numPages: 1,
      readDone: 0,
      currentProgress: 0,
      pageCount: 0,
      pdfUrl: ''
    };
  },
  props: {
    url: {
      type: String,
      default: '',
    },
  },
  components: {
    pdf,
  },
  mounted() {
    this.handleOpenPDF();
  },
  watch: {
    url(newVal) {
      this.handleOpenPDF(newVal);
    },
  },
  methods: {
    handleOpenPDF(url) {
      if (this.url || url) {
        this.pdfUrl = pdf.createLoadingTask({ url: this.url, CMapReaderFactory })
        this.pdfUrl.promise.then(pdf => {
          if (pdf.numPages) {
            this.numPages = pdf.numPages;
            if (this.numPages === 1) {
              this.createdScroll();
            }
          }
        });
      }
    },
  },
};
</script>

<style lang="less" scoped>
.pdf-container {
  overflow: scroll;
  height: calc(100vh - 278px);
}
</style>
