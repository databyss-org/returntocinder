const biblioLinkChecker = ({ e, history }) => {
  let target = e.target.id;
  if (target.split('-')[0] === 'biblio') {
    history.push(`/source/${target.split('-')[1]}`);
  }
};

export default biblioLinkChecker;
