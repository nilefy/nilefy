import rehypeParse from 'rehype-parse';
import rehypeSanitize from 'rehype-sanitize';
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
          .use(rehypeSanitize)
          .use(rehypeStringify)
          .process(text);

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
