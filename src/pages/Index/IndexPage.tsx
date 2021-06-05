import styles from 'pages/Index/IndexPage.module.scss';
import { Link } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { queryForAllTags, selectArticlesData } from 'app/articlesSlice';
import { LoginType, selectLoginType } from 'app/adminSlice';

import { validPageLink } from 'utils/functions';

interface FilterSettings {
    draftStatus: boolean;
    tagFilters: string[];
}

function IndexPage() {
    const articlesData = useAppSelector(selectArticlesData);
    const currentLoginType = useAppSelector(selectLoginType);
    const isAdmin = currentLoginType === LoginType.Admin;

    const dispatch = useAppDispatch();
    // dispatch

    return (
        <div className={styles.index}>
            {
                (isAdmin) ?
                    articlesData.articles.map(({ name, draftStatus }) => (
                        <p key={name} >
                            <Link to={validPageLink(name)}>
                            {(draftStatus) ? "[DRAFT*] " + name : name}
                        </Link>
                            </p>
                    ))
                    :
                    // I should technically not check for undefined, but okay.
                    articlesData.articles
                        .filter(({ draftStatus }) => draftStatus === false || draftStatus === undefined)
                        .map(({ name }) => (
                            <p key={name} >
                                <Link to={validPageLink(name)}>
                                {name}
                            </Link>
                                </p>
                        ))
            }
        </div>
    );
}

export default IndexPage;
