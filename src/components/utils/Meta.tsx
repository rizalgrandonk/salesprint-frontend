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
    title: "Situs Jual Beli Online dengan Inovasi Terbaru | Salesprint",
    keywords:
      "e-commerce, market, marketplace, jual beli, online, toko, inovasi",
    description:
      "Salesprint adalah destinasi belanja daring yang menghadirkan pengalaman tanpa batas bagi para konsumen yang mencari kecepatan, kemudahan, dan hemat dalam satu tempat. Dengan koleksi produk yang beragam dan harga yang terjangkau, Salesprint memberikan akses langsung ke berbagai kebutuhan konsumen sehari-hari. Dibangun dengan inovasi terkini, platform ini menawarkan kecepatan dalam proses transaksi, serta menyuguhkan fitur-fitur eksklusif yang membuat pengalaman belanja semakin menyenangkan. Salesprint tidak hanya sekadar e-commerce, tetapi merupakan akselerator belanja bagi mereka yang menghargai efisiensi tanpa mengorbankan kualitas. Selamat datang di Salesprint, di mana setiap langkah belanja Anda adalah sprint menuju kepuasan yang sejati!",
    shareImage: "https://salesprint.vercel.app/images/banner.png",
    url: `https://salesprint.vercel.app${asPath}`,
    article: false,
  };

  const fullSeo: SeoData = {
    ...defaultSeo,
    ...seo,
    keywords: `${seo.keywords ? seo.keywords + ", " : ""}${
      defaultSeo.keywords
    }`,
  };

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
      <link rel="manifest" href="/site.webmanifest" />
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
      <meta property="og:site_name" content="Salesprint" />

      {fullSeo.article && <meta property="og:type" content="article" />}
    </Head>
  );
}
