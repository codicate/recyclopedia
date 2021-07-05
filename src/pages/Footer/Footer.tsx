import styles from "./Footer.module.scss";
import { SocialIcon } from "react-social-icons";


function Footer() {
  const socialIcoColor = "hsl(146, 41%, 60%)";

  return (
    <div id={styles.footer}>
      <div id={styles.content}>
        <section id={styles.social}>
          <div>
            <SocialIcon bgColor={socialIcoColor} url="https://www.instagram.com/projectenv/" />
            <SocialIcon bgColor={socialIcoColor} url="https://twitter.com/projectenv" />
            <SocialIcon bgColor={socialIcoColor} url="https://medium.com/the-environment-project" />
            <SocialIcon bgColor={socialIcoColor} url="https://www.facebook.com/projectenv" />
            <SocialIcon bgColor={socialIcoColor} url="https://www.linkedin.com/company/projectenv/" />
            <SocialIcon bgColor={socialIcoColor} url="https://www.snapchat.com/add/theenvproject/" />
          </div>
        </section>
        <section id={styles.about}>
          <p>
            Founded by a group of NYC students in 2020, the Environment Project is a youth-led non-partisan, non-profit organization dedicated to empowering the next generation of climate activists and leaders through digital advocacy and grassroots efforts.

            The Environment Project is fiscally sponsored by Youth Leadership Incubator dba HackPlus, a 501(c)(3) nonprofit organization. All donations are fully tax-deductible.
          </p>
          <p>
            © {new Date().getFullYear()} The Environment Project
          </p>
        </section>
      </div>
    </div>
  );
}

export default Footer;
