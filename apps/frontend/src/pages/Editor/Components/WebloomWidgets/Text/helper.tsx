import rehypeParse from 'rehype-parse';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import Markdown from 'markdown-to-jsx';
import { unified } from 'unified';
import { useState, useEffect } from 'react';
export const useDataFetcher = (text: string) => {
  const [content, setContent] = useState<React.ReactElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const processedFile = await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeSanitize, {
            ...defaultSchema,
            attributes: {
              ...defaultSchema.attributes,
              h1: ['style'],
              h2: ['style'],
              h3: ['style'],
              h4: ['style'],
              h5: ['style'],
              h6: ['style'],
              p: ['style'],
              span: ['style'],
              div: ['style'],
            },
          })
          .use(rehypeStringify)
          .process(text);
        console.log(String(processedFile.value), 'kk');
        setContent(<Markdown>{String(processedFile)}</Markdown>);
      } catch (error) {
        console.error('Error processing file:', error);
        setContent(null); // Or handle error appropriately
      }
    };

    fetchData();
  }, [text]);

  return content;
};
