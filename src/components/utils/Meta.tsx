import Head from "next/head";
import { useRouter } from "next/router";

type SeoData = {
  title: string;
  keywords: string;
  description: string;
  shareImage: string;
  url: string;
  article: boolean;
};

type MetaProps = Partial<SeoData>;

export default function Meta(seo: MetaProps) {
  const { asPath } = useRouter();

  const defaultSeo: SeoData = {
    title: "Salesprint | Sale on a big sale",
    keywords: "merch, clothing, brand",
    description:
      "Grandonk Merch is a place to get the nice looking clothes and merch",
    shareImage:
      "https://res.cloudinary.com/grandonk-merch/image/upload/v1630526973/banner_o3vmy7.jpg",
    url: `https://grandonkmerch.vercel.app${asPath}`,
    article: false,
  };

  const fullSeo = { ...defaultSeo, ...seo };

  return (
    <Head>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/icons/apple-touch-icon.png?v=3"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/icons/favicon-32x32.png?v=3"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/icons/favicon-16x16.png?v=3"
      />
      {/* <link rel="manifest" href="/manifest.json" /> */}
      <link
        rel="mask-icon"
        href="/icons/safari-pinned-tab.svg?v=3"
        color="#515151"
      />
      <link rel="shortcut icon" href="/icons/favicon.ico?v=3" />
      <meta name="apple-mobile-web-app-title" content="Grandonk Merch" />
      <meta name="application-name" content="Grandonk Merch" />
      <meta name="msapplication-TileColor" content="#2b5797" />
      <meta
        name="msapplication-config"
        content="/icons/browserconfig.xml?v=3"
      />
      <meta name="theme-color" content="#ffffff" />

      <meta name="keywords" content={fullSeo.keywords} />
      <link rel="canonical" href={fullSeo.url} />

      <title>{fullSeo.title}</title>
      <meta property="og:title" content={fullSeo.title} />
      <meta name="twitter:title" content={fullSeo.title} />

      <meta name="description" content={fullSeo.description} />
      <meta property="og:description" content={fullSeo.description} />
      <meta name="twitter:description" content={fullSeo.description} />

      <meta name="image" content={fullSeo.shareImage} />
      <meta property="og:image" content={fullSeo.shareImage} />
      <meta name="twitter:image" content={fullSeo.shareImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@site" />
      <meta name="twitter:creator" content="@handle" />

      <meta property="og:url" content={fullSeo.url} />
      <meta property="og:site_name" content="Grandonk Merch" />

      {fullSeo.article && <meta property="og:type" content="article" />}
    </Head>
  );
}
