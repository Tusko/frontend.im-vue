-- "Soon" projects are listed on the site but not linked
ALTER TABLE projects ADD COLUMN soon INTEGER NOT NULL DEFAULT 0;

-- Restore the flag from the old WordPress site (acf.soon); ids were kept by the import
UPDATE projects SET soon = 1 WHERE id IN (362, 194, 189, 197);
