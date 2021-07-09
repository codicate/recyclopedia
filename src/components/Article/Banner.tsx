import styles from "./Banner.module.scss";


function Banner({
  bannerImage
}: {
  bannerImage: string;
}) {
  return (
    <div className={styles.bannerContainer}>
      <img src={bannerImage} />
    </div>
  );
}

export default Banner;