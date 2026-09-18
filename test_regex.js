const className = "flex flex-col md:flex-row gap-4 sm:gap-6 lg:items-center text-sm lg:text-base";
let newClasses = [];
className.split(' ').forEach(c => {
  newClasses.push(c);
  if (c.startsWith('sm:')) newClasses.push(c.substring(3));
  if (c.startsWith('md:')) newClasses.push(c.substring(3));
  if (c.startsWith('lg:')) newClasses.push(c.substring(3));
});
console.log(newClasses.join(' '));
