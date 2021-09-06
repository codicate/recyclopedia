import styles from "./Banner.module.scss";
import Image from 'next/image';


function Banner({
  bannerImage
}: {
  bannerImage: string;
}) {
  return (
    <div className={styles.bannerContainer}>
      <Image
        // src={bannerImage}
        // This is necesary because all external image domains need to be added to next.config.js, and I ain't got time for that
        // Later on all banner image will likely be admin uploaded anyway and hosted with imgBB
        src="/images/banner-placeholder.jpg"
        // to be replaced with banner.alt if needed
        alt="banner image"
        layout="responsive"
        height={1}
        width={2}
      />
    </div>
  );
}

export default Banner;